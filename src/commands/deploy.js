// 3 - Create the archive and staging bucket
// 4 - Check if BigQuery dataset exists, create the dataset
//  if it does not
// 5 - Create the code for the embulk_config.yml and the
//  index.js of the function from the mashr_config.yml
// 6 - Launches a GCS instance with a Mashr Container with our
//  embulk_config.yml in it, and a cron job running
// 7 - Launches a function with the same name

const { readYaml} = require('../utils/fileUtils');
const configureCredentials = require('../utils/configureCredentials');
const { validateIntegrationName } = require('../gcp/validateIntegrationName');
const createBuckets = require('../gcp/createBuckets');
const { createCloudFunction } = require('../gcp/createCloudFunction');
const addIntegrationToDirectory = require('../utils/addIntegrationToDirectory');
// Mat moved functions outside of deploy
const yaml = require('js-yaml');
const createEmbulkConfig = require('../utils/createEmbulkConfig');

module.exports = async (args) => {
  const mashrConfigObj = await readYaml('./mashr_config.yml');

  // TODO: add mashr_config validation
  // - move validateKeyFile from configureCredentials
  // - add embulkRunCommandValidation
  //   - if no embulk_config.yml throw error
  //   - if no '-c...yml' throw warning
  //   - give a warning/error if embulk is undefined, or there is no 'in:type'
  // - add a field to mashrConfigObj: gce_instance_name
  //    - if the integration_name matches (?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)
  //    then use that as gce_instance_name
  //    - if it does not pass regex, replace uppercase with lowercase, replace non [-a-z0-9] with -
  //    ... in worse case return the error 'Rename your integration...' w/ google's error
  // - validate that the dataset is there (or create it if not?)

  await configureCredentials(mashrConfigObj);

  const integrationName = mashrConfigObj.mashr.integration_name.trim();
  await validateIntegrationName(integrationName);
  // [TODO: add validateGCEInstanceName(integrationName)]
  // [TODO: createBuckets continue to happen in the background during createCloudFunction. Examine this.]
  await createBuckets(integrationName);
  await createCloudFunction(mashrConfigObj);
  await createGCEInstance(mashrConfigObj);

  await addIntegrationToDirectory(mashrConfigObj);

  // TODO:
  //  - if deploy is run twice on the same mashr_config,
  //  does it provide an error (current action) or does it
  //  overwrite?
  //  - if default region doesn't exist in init, where is the bucket, GCE, and
  //  GCF created? Does it matter?
};

const { readFile } = require('../utils/fileUtils');
const generateGCEResources = async (mashrConfigObj) => {
  const dockerfile = await readFile(`${__dirname}/../../templates/docker/Dockerfile`);
  const gemInstallationScript = createGemInstallationScript(mashrConfigObj.mashr.embulk_gems);
  const keyfile = await readFile(`${mashrConfigObj.mashr.json_keyfile}`);
  const embulkScript = createEmbulkScript(mashrConfigObj.mashr.embulk_run_command);
  const crontab = await readFile(`${__dirname}/../../templates/docker/crontab`);
  const embulkConfig = createEmbulkConfig(mashrConfigObj);

  return {
    dockerfile,
    gemInstallationScript,
    keyfile,
    embulkScript,
    crontab,
    embulkConfig,
  };
};


const createEmbulkScript = (runCommand) => {
  // TODO: place logs in stackdriver
  // TODO: what to do with logs? Does the log file get too large?
  // diff file run from root of container. Can't use it after?
  runCommand = runCommand.replace(
    'embulk_config.yml', '/root/mashr/embulk_config.yml.liquid');

  const script =
`#!/bin/bash
export DATE=$(date +"%Y-%m-%dT%H-%M-%S-%3N")

${runCommand} >> /var/log/cron.log 2>&1
`;

  return script;
}

const createGemInstallationScript = (gems) => {
  if (!gems) return '#!/bin/bash';

  const installGemsArray = gems.map((name) => (
      `embulk gem install ${name}`
    )
  );

  return `#!/bin/bash\n${installGemsArray.join('\n')}`;
};

const Compute = require('@google-cloud/compute');
const createGCEInstance = async (mashrConfigObj) => {

  const compute = new Compute();

  const zone = compute.zone('us-central1-a');

  const {
    dockerfile,
    gemInstallationScript,
    embulkConfig,
    keyfile,
    embulkScript,
    crontab,
  } = await generateGCEResources(mashrConfigObj);

  const config = {
    os: 'debian-9',
    http: true,
    machineType: 'g1-small',
    tags: ["mashr"],
    metadata: {
      items: [
        {
          key: 'startup-script',
          value: `#! /bin/bash

          sudo apt-get update
          sudo apt install apt-transport-https ca-certificates curl gnupg2 software-properties-common -y
          curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
          sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
          sudo apt update
          sudo apt install docker-ce -y

          cd /
          sudo mkdir app
          cd app
          echo "${dockerfile.toString()}" > Dockerfile
          echo '${embulkScript}' > embulkScript.sh
          echo '${crontab.toString()}' > crontab
          sudo mkdir mashr
          echo "${gemInstallationScript}" > mashr/install_gems.sh
          echo "${embulkConfig}" > mashr/embulk_config.yml.liquid
          printf "%s\n" '${keyfile.toString()}' > mashr/keyfile.json

          sudo docker pull jacobleecd/mashr:latest
          sudo docker build -t mashr .
          sudo docker run -d -v /mashr --name embulk-container mashr
          `
        },
      ],
    },
  };

  const vm = zone.vm(mashrConfigObj.mashr.integration_name);
  // const vm = zone.vm('newname');

  vm.create(config);
  // vm.create(config, function(err, vm, operation, apiResponse) {
  //   // `vm` is a VM object.

  //   // `operation` is an Operation object that can be used to check the
  //   // status of the request.
  //   console.log('!!!!!!!!!!!!!!');
  //   console.log('VM: ', vm);
  //   console.log('!!!!!!!!!!!!!!');
  //   console.log('operation: ', operation);
  //   console.log('!!!!!!!!!!!!!!');
  //   console.log('apiResponse: ', apiResponse);
  //   console.log('!!!!!!!!!!!!!!');
  //   console.log('error: ', err);
  // });

};
