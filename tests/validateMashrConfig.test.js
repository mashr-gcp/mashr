const {
  validateMashrConfig,
  validateIngrationName,
  validateEmbulkRunCommand,
  validateBQNames,
} = require('../src/utils');

describe('validateMashrConfig()', () => {
  describe('checkRequiredValues()', () => {

  });

  describe('validateIntegrationName()', () => {

  });

  describe('validateEmbulkRunCommand()', () => {
    const invalidCommand = 'embulk run';
    const validCommand = 'embulk run embulk_config.yml';

    it('throws error if " embulk_config.yml" isn\'t in run command', () => {
      expect(() => {
        validateEmbulkRunCommand(invalidCommand);
      }).toThrow();
    });

    it('successfully returns when " embulk_config.yml" is in run command', () => {
      const result = validateEmbulkRunCommand(validCommand);
      expect(result).toBe(undefined);
    });
  });

  describe('validateBQNames()', () => {
    it('returns undefined for a valid name.', async () => {
      expect(validateBQNames('mashrtest')).toEqual(undefined);
    });

    it('throws an error if there is a dash', async () => {
      expect(() => {
        validateBQNames('mashr-test');
      }).toThrow("Name must match regex: ^[_A-z0-9]{0,1024}$");
    });

    it('throws an error if there is a strange chracter `$`', async () => {
      expect(() => {
        validateBQNames('ma$hr-test');
      }).toThrow("Name must match regex: ^[_A-z0-9]{0,1024}$");
    });
  });
});

// - validateMashrConfig.test.js (do last)
//   (*work with original file, and remove / add values as needed*)
//   (*read a template in and add values to the object*)


//   - describe checkRequiredValues()
//     - it throws an error if there are fields missing (*7 + 1 (passing scenario) for each value)
//     - doesnt do anything if all the fields are there (1)



//   - describe validateIntegrationName()
//     - throws an error if the name is invalid (*2-3 invalid strings)
//     - does nothing if the name is valid (1 string)

//     - doesnt do anything if embulk_config.yml is in command


//   - describe validateBQNames()
//     - throws an error if the name is invalid (*2-3 invalid strings)
//     - does nothing if the name is valid (1 string)
