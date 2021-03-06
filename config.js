/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "gra*$jkyuludsth";

const PORT = +process.env.PORT || 3000;

let BCRYPT_WORK_FACTOR;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/jobly-test`;
  BCRYPT_WORK_FACTOR = 1;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/jobly`;
  BCRYPT_WORK_FACTOR = 12;
}

module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  BCRYPT_WORK_FACTOR
};
