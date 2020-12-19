DROP DATABASE IF EXISTS jobly;

CREATE DATABASE jobly;

\c jobly

DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
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