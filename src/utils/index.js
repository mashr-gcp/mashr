const { addIntegrationToDirectory } = require('./addIntegrationToDirectory');
const { mashrLogger } = require('./mashrLogger');
const { catchSetupAndConfig } = require('./catchSetupAndConfig');
const { setupDirectoriesAndFiles } = require('./setupDirectoriesAndFiles');
const { confirmDestroy } = require('./confirmDestroy');
const { checkMashrInitialized } = require('./checkMashrInitialized');
const {
  copyMashrConfigTemplate,
  templatePath,
} = require('./copyMashrConfigTemplate');
const {
  validateMashrConfig,
  checkRequiredValues,
  errorIfMissing,
  checkIntegrationExists,
  validateIntegrationName,
  validateKeyfile,
  validateEmbulkRunCommand,
  validateBQNames,
} = require('./validateMashrConfig');
const {
  copyFile,
  createDirectory,
  createJSONFile,
  exec,
  exists,
  getMashrPath,
  mkdir,
  readFile,
  readJsonFile,
  readResources,
  readYaml,
  removeResource,
  rimraf,
  writeFile,
  writeResources,
} = require('./fileUtils');

module.exports = {
  addIntegrationToDirectory,
  catchSetupAndConfig,
  templatePath,
  checkIntegrationExists,
  checkRequiredValues,
  confirmDestroy,
  copyFile,
  copyMashrConfigTemplate,
  checkMashrInitialized,
  createDirectory,
  createJSONFile,
  errorIfMissing,
  exec,
  exists,
  getMashrPath,
  mashrLogger,
  mkdir,
  readFile,
  readJsonFile,
  readResources,
  readYaml,
  removeResource,
  rimraf,
  setupDirectoriesAndFiles,
  validateBQNames,
  validateEmbulkRunCommand,
  validateIntegrationName,
  validateKeyfile,
  validateMashrConfig,
  writeFile,
  writeResources,
};
