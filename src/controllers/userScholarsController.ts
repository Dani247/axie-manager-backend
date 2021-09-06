import { genSalt, hash, compare } from "bcryptjs";
import { v4 } from "uuid";
import { QueryResult } from "pg";
import { IScholar, IUser } from "types";
import { openClient } from "../utils/db";
import axios, { AxiosResponse } from "axios";

export async function managerHasScholar(
  managerId: string,
  scholarAddress: string
): Promise<boolean> {
  const client = openClient();
  await client.connect();
  const query = `
    SELECT "scholarAddress", "managerId"
    FROM public.scholars
    WHERE "managerId" = $1 AND "scholarAddress" = $2;
  `;
  const res = await client.query(query, [managerId, scholarAddress]);
  await client.end();

  if (res.rowCount > 0) {
    return res.rows[0];
  }
  return false;
}

export async function addScholar(
  managerId: string,
  scholarAddress: string
): Promise<IScholar | false> {
  const client = openClient();
  await client.connect();
  const query = `
    INSERT INTO public.scholars(
    "scholarAddress", "managerId")
    VALUES ($2, $1)
    RETURNING "scholarAddress", "managerId";
  `;
  const res = await client.query(query, [managerId, scholarAddress]);
  await client.end();

  return res.rows[0];
}

export async function getManagerScholarsAddresses(
  managerId: string
): Promise<Array<string>> {
  const client = openClient();
  await client.connect();
  const query = `
    SELECT "scholarAddress"
    FROM public.scholars
    WHERE "managerId" = $1
  `;
  const res = await client.query(query, [managerId]);
  await client.end();

  return res.rows.map((arr) => arr?.scholarAddress);
}

export async function getScholarEarnings(
  scholarAddress: string
): Promise<AxiosResponse<any> | null> {
  const res = await axios.get(
    `https://axie-proxy.secret-shop.buzz/_schoEarnings/${scholarAddress}`
  );
  if (res.data.success === true) {
    return res.data.earnings;
  }
  return null;
}

export async function getScholarAxies(
  scholarAddress: string
): Promise<AxiosResponse<any> | null> {
  const res = await axios.get(
    `https://axie-proxy.secret-shop.buzz/_axies/${scholarAddress}`
  );

  return res.data?.available_axies?.results;
}

export async function getScholarStats(
  scholarAddress: string
): Promise<AxiosResponse<any> | null> {
  const res = await axios.get(
    `https://axie-proxy.secret-shop.buzz/_stats/${scholarAddress}`
  );

  if (res.data.success === true) {
    return res.data.stats;
  }
  return null;
}

export async function getDashboardData(managerId: string): Promise<any> {
  const scholarsAddresses = await getManagerScholarsAddresses(managerId);

  const scholarPromises = scholarsAddresses.map((address) =>
    Promise.all([
      getScholarEarnings(address),
      getScholarAxies(address),
      getScholarStats(address),
    ])
  );
  const scholarDataRes = await Promise.all(scholarPromises);

  const scholarData = scholarDataRes.map(([earning, axies, stats]) => {
    return { stats, earning, axies };
  });

  return scholarData;
}
