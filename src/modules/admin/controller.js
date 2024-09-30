import { validateSignUpInputs, validateSignInInputs } from "./validation.js";

import {
  countUsersByCondition,
  createUser,
  getAllUser,
  getUserByConditions,
} from "./services.js";
import {
  apiError,
  generateToken,
  generateRefreshToken,
} from "../../utils/index.js";
import { MESSEGES } from "../../constants/index.js";

// Admin signup
export const signUp = async (req, res, next) => {
  const validationResult = validateSignUpInputs(req.body);
  console.log(validationResult, "validationResult");

  if (validationResult?.error)
    return next(apiError.badRequest(validationResult?.msg, "signUp"));

  // const { username, password } = req.body;

  try {
    const admin = await createUser({ ...req.body, role: "admin" }, next);

    if (!admin)
      throw next(apiError.badRequest(MESSEGES.USER_CREATION_FAILED, "signup"));

    return res
      .status(201)
      .send({ isSucess: true, message: MESSEGES.SIGNUP_SUCCESSFULL });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error, "signup"));
  }
};
export const signIn = async (req, res, next) => {
  try {
    let { password, username } = req.body;

    const validationResult = validateSignInInputs(req.body);

    if (validationResult?.error) {
      return next(apiError.badRequest(validationResult?.msg, "signin"));
    }

    let existingUser = await getUserByConditions({ username }, "-__v", true);

    if (!existingUser) {
      return next(apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, "signin"));
    }

    const match = await existingUser?.checkPassword(password);

    if (!match)
      return next(apiError.badRequest(MESSEGES.PASSWORD_INVALID, "signin"));

    existingUser = existingUser.toObject({ getters: true });

    const token = await generateToken({
      username: existingUser?.username,
      role: existingUser?.role,
      id: existingUser.id,
    });
    const refreshToken = await generateRefreshToken({
      username: existingUser?.username,
      role: existingUser?.role,
      id: existingUser.id,
    });

    delete existingUser.password;

    return res.status(201).send({
      isSucess: true,
      message: MESSEGES.SIGNIN_SUCCESSFULL,
      token,
      refreshToken,
      data: { ...existingUser },
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error, "signup"));
  }
};

export const createNewUser = async (req, res, next) => {
  try {
    console.log("1");

    const user = await createUser(
      {
        ...req.body,
      },
      next
    );
    console.log("hello");
    
    if (!user)
      throw next(apiError.badRequest(MESSEGES.USER_CREATION_FAILED, "signup"));

    return res.status(201).send({
      isSuccess: true,
      message: MESSEGES.EMAIL_SENT,
      data: { email: req.body?.email },
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error, "signup"));
  }
};

export const updateBalance = async (req, res, next) => {
  const { username, balance } = req.body;
  try {
    let user = await getUserByConditions({ username }, "-__v", true);

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, "updateBalanceAdmin")
      );
    }

    user.balance = balance;
    await user.save();

    res.json({ msg: "User balance updated successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const getUsers = async (req, res, next) => {
  try {
    let user = await getAllUser();

    if (user.length <= 0) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, "updateBalanceAdmin")
      );
    }
    const userCount = await countUsersByCondition();

    return res.status(201).send({
      isSucess: true,
      message: MESSEGES.USER_RETREIVED,
      totalUsers: userCount,
      data: [...user],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export default {
  signUp,
  signIn,
  createNewUser,
  updateBalance,
  getUsers,
};
