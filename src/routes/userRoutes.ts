import { Router } from 'express';
import { verify } from 'jsonwebtoken';
import { IUser, IUserLoginResponse, IErrorResponse } from 'types';
import { addNewUser, getUserByEmail, validateLoginCredentials } from '../controllers/userController';
import { validateEmail } from '../utils/regex'
import { generateTokens, checkIfTokenExists, removeToken } from '../utils/token';

const router = Router();

// RETURNS ACCESS AND REFRESH TOKEN BASED ON EMAIL AND PASSWORD
/**
 * @swagger
 * components:
 *   schemas:
 *     UserCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: email required to register and login
 *         password:
 *           type: string
 *           description: password required to register and login
 *       example:
 *         email: john@gmail.com
 *         password: 123
 *      LoginResponse:
 *        type: object
 *        
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // VALIDATE EMAIL
  if (!email || !validateEmail(email)) {
    res.status(400).json({ msg: "Invalid email address" })
    return;
  }

  // VALIDATE IF USER EXISTS
  try {
    const userByEmail = await getUserByEmail(email)
    if (!userByEmail) {
      res.status(404).json({ msg: "User with that email not found" })
      return;
    }
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }

  // VALIDATE CREDENTIALS
  try {
    const passwordMatch = await validateLoginCredentials(email, password)
    if (!passwordMatch) {
      res.status(403).json({ msg: "Incorrect password" })
      return;
    }
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }

  // LOGIN
  try {
    const userRes = await getUserByEmail(email, true);
    if (!userRes) {
      res.status(404).json({ msg: "User with that email not found" });
      return;
    }
    const userByEmail: IUser = userRes;
    const { accessToken, refreshToken } = await generateTokens(userByEmail as IUser);
    const userLoginResponse: IUserLoginResponse = { msg: "User logged in", user: userByEmail, accessToken, refreshToken }
    res.status(200).json(userLoginResponse)
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }
});


// CREATES A NEW USER AND RETURNS IT WITH AN ACCESS AND REFRESH TOKEN
router.post("/register", async (req, res) => {
  const { email } = req.body;

  console.log("validating")
  // VALIDATE EMAIL
  if (!email || !validateEmail(email)) {
    res.status(400).json({ msg: "Invalid email address" })
    return;
  }

  // VALIDATE IF EMAIL IS TAKEN
  try {
    const userByEmail = await getUserByEmail(email)
    if (userByEmail) {
      res.status(400).json({ msg: "Email taken" })
      return;
    }
  } catch (error) {
    console.log(error);
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }

  // ADD USER
  try {
    const newUser: IUser = await addNewUser(req.body);
    // generate token
    const { accessToken, refreshToken } = await generateTokens(newUser);
    const userLoginResponse: IUserLoginResponse = { msg: "User created", user: newUser, accessToken, refreshToken }
    res.status(200).json(userLoginResponse)
    return;
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }
});


// REFRESH TOKEN
router.post("/refresh", async (req, res) => {
  const { token } = req.body;

  // check token
  if (!token) return res.status(400).json({ msg: "Invalid or expired token" });

  // VALIDATE IF TOKEN EXISTS
  try {
    const tokenExists = await checkIfTokenExists(token)
    if (!tokenExists) {
      res.status(403).json({ msg: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }

  // VERIFY TOKEN WITH SECRET STRING AND RETURN NEW TOKENS
  try {
    const user = await verify(token, process.env.REFRESH_TOKEN_SECRET as string);
    const newUser = { ...user as any }
    delete newUser.iat;

    const { accessToken, refreshToken } = await generateTokens(newUser as IUser)
    const response: IUserLoginResponse = { msg: "Token refreshed", user: newUser, accessToken, refreshToken };
    res.status(200).json(response)
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }
});

router.post("/logout", async (req, res) => {
  const { token } = req.body;
  try {
    await removeToken(token);
    res.status(200).json({ msg: "User Logged out" });
  } catch (error) {
    console.log(error)
    const response: IErrorResponse = { msg: "internal server error", error }
    res.status(500).json(response)
    return;
  }
});

export default router;