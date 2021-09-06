import { Pool, Client } from 'pg'

export function openPool() {
  const DB_NAME = process.env["DB_NAME"];
  const DB_USER = process.env["DB_USER"];
  const DB_PASSWORD = process.env["DB_PASSWORD"]
  const DB_HOSTNAME = process.env["DB_HOSTNAME"]
  const DB_PORT = Number(process.env["DB_PORT"])

  const poolConfig = {
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOSTNAME,
    port: DB_PORT
  };

  return new Pool(poolConfig);
}

export function openClient() {
  const DB_NAME = process.env["DB_NAME"];
  const DB_USER = process.env["DB_USER"];
  const DB_PASSWORD = process.env["DB_PASSWORD"]
  const DB_HOSTNAME = process.env["DB_HOSTNAME"]
  const DB_PORT = Number(process.env["DB_PORT"])

  const clientConfig = {
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOSTNAME,
    port: DB_PORT
  };

  console.log("opening client", clientConfig)

  return new Client(clientConfig);
}