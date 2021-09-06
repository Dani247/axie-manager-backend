import { genSalt, hash, compare } from "bcryptjs";
import { v4 } from "uuid";
import { QueryResult } from "pg";
import { IUser } from "types";
import { openClient } from "../utils/db";

export async function getUserByEmail(
  email: string,
  noPassword: boolean = false
): Promise<IUser | false> {
  const client = openClient();
  await client.connect();
  const query = `
    SELECT ${
      noPassword ? "id, email" : "*"
    }
    FROM public.users
    WHERE email=$1;
  `;
  const res = await client.query(query, [email]);
  await client.end();

  if (res.rowCount > 0) {
    return res.rows[0];
  }
  return false;
}

export async function addNewUser(user: IUser): Promise<IUser> {
  console.log("connecting")
  const client = openClient();
  await client.connect();
  console.log("connected")
  const query = `
    INSERT INTO public.users(id, email, salt, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email;
  `;

  // CREATE ID
  const id = v4();

  // ENCRYPT PASSWORD
  const salt = await genSalt(10);
  const passwordHash = await hash(user.password as string, salt);

  const res: QueryResult<IUser> = await client.query(query, [
    id,
    user.email,
    salt,
    passwordHash,
  ]);
  await client.end();

  const newUser: IUser = res.rows[0];
  return newUser;
}

export async function validateLoginCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user) return false;
  const isValid = await compare(password, user.password as string);
  return isValid;
}
