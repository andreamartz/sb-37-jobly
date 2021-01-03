/**
 * 
 * Validate data using jsonschema
 * 
 */

const ExpressError = require("./expressError");
const jsonschema = require("jsonschema");

function validateData(data, schema) {
  // validate the data 
  const validation = jsonschema.validate(data, schema);

  // if validation fails
  if (!validation.valid) {
    // create validation error
    const listOfErrors = validation.errors.map(error => error.stack);
    const error = new ExpressError(listOfErrors, 400);
    return error;
  }
  return validation.valid;
}

module.exports = validateData;

