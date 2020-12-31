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
    const listOfErrors = validation.errors.map(error => error. stack);
    const error = new ExpressError(listOfErrors, 400);
    console.log("error: ", error);
    return error;
  }
  return validation.valid;
}

module.exports = validateData;

// ************************************
/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - items: an object with keys of columns you want to update and values with
 *          updated values
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

// function sqlForPartialUpdate(table, items, key, id) {
//   // keep track of item indexes
//   // store all the columns we want to update and associate with vals

//   let idx = 1;
//   let columns = [];

//   // filter out keys that start with "_" -- we don't want these in DB
//   for (let key in items) {
//     if (key.startsWith("_")) {
//       delete items[key];
//     }
//   }

//   for (let column in items) {
//     columns.push(`${column}=$${idx}`);
//     idx += 1;
//   }

//   // build query
//   let cols = columns.join(", ");
//   let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING *`;

//   let values = Object.values(items);
//   values.push(id);

//   return { query, values };
// }

// module.exports = sqlForPartialUpdate;
