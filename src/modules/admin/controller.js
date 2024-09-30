import { validateSignUpInputs, validateSignInInputs } from "./validation.js";

import {
  countUsersByCondition,
  createUser,
  getAllUser,
  getUserByConditions,
  updateUserbyId,
} from "./services.js";
import {
  apiError,
  generateToken,
  generateRefreshToken,
} from "../../utils/index.js";
import { MESSEGES } from "../../constants/index.js";

// Admin signup
// export const signUp = async (req, res, next) => {
//   const validationResult = validateSignUpInputs(req.body);

//   if (validationResult?.error)
//     return next(apiError.badRequest(validationResult?.msg, "signUp"));

//   // const { username, password } = req.body;

//   try {
//     const admin = await createUser({ ...req.body, role: "admin" }, next);

//     if (!admin)
//       throw next(apiError.badRequest(MESSEGES.USER_CREATION_FAILED, "signup"));

//     return res
//       .status(201)
//       .send({ isSucess: true, message: MESSEGES.SIGNUP_SUCCESSFULL });
//   } catch (error) {
//     console.log(error);
//     return next(apiError.internal(error, "signup"));
//   }
// };

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



    const tokenPayload = {
      _id: existingUser?._id,
      email: existingUser?.email,
      role: existingUser?.role,
    };
    const token = await generateToken(tokenPayload, existingUser?.role);

    const refreshToken = await generateRefreshToken(
      tokenPayload,
      existingUser?.role
    );
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
     const user = await createUser(
      {
        ...req.body,
      },
      next
    );    

    if (!user)
      throw next(apiError.badRequest(MESSEGES.USER_CREATION_FAILED, "signup"));

    return res.status(201).send({
      isSuccess: true,
      message: MESSEGES.USER_CREATED,
      data: { user },
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error, "signup"));
  }
};



export const updateUser = async (req, res, next) => {
  
  const { userId } = req.params;

  if (!userId) {
    return next(apiError.badRequest(MESSEGES.USER_ID_REQUIRED, "updateUser"));
  }

  try {
    let user = await getUserByConditions({ _id: userId }, "-__v");

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, "updateUser")
      );
    }


    const updatedUser = await updateUserbyId(userId, req.body);

    if (!updatedUser) {
      return next(
        apiError.badRequest(MESSEGES.USER_UPDATE_FAILED, "updateUser")
      );
    }

    res.json({ msg: "User updated successfully", data: updatedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


export const getUsers = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;
    const users = await getAllUser(skip, limit);

    if (users.length <= 0) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, "getUsers")
      );
    }

    const userCount = await countUsersByCondition();
    return res.status(200).send({
      isSuccess: true,
      message: MESSEGES.USERS_RETRIEVED,
      totalUsers: userCount,
      totalPages: Math.ceil(userCount / limit),
      currentPage: Number(page),
      data: users,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export default {
  // signUp,
  signIn,
  createNewUser,
  updateUser,
  getUsers,
};
