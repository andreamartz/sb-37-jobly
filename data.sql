DROP DATABASE IF EXISTS jobly;

CREATE DATABASE jobly;

\c jobly

DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL CHECK (equity <= 1),
  company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO companies
  (handle, name, num_employees, description, logo_url)
VALUES
  ('WMT', 'Walmart', 20000, 'mega low-tier discount department store', 'https://placekitten.com/200/300');

INSERT INTO companies
  (handle, name, num_employees, description, logo_url)
VALUES
  ('NOW', 'Service Now', 695, 'startup business services company', 'https://placekitten.com/200/300');

INSERT INTO companies
  (handle, name, num_employees, description, logo_url)
VALUES
  ('NFLX', 'Netflix', 729, 'video streaming service', 'https://placekitten.com/200/300');