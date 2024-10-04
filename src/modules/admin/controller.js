import {
  validateSignUpInputs,
  validateSignInInputs,
  schema,
  purchaseSchema,
} from "./validation.js";

import {
  countUsersByCondition,
  createUser,
  deleteUserById,
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
import { Bond, UserModel } from "./model.js";

export const signIn = async (req, res, next) => {
  try {
    const validationResult = validateSignInInputs(req.body);

    let { password, username } = req.body;

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

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await deleteUserById(userId, next);

    if (!user) {
      throw next(apiError.notFound(MESSEGES.USER_NOT_FOUND, "deleteUser"));
    }

    return res.status(200).send({
      isSuccess: true,
      message: MESSEGES.USER_DELETED,
      data: { userId },
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error, "deleteUser"));
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

export const createBond = async (req, res, next) => {
  try {
    const { bondType, date } = req.body;
    const bond = new Bond({ bondType, date });
    await bond.save();
    res.status(201).json(bond);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllBonds = async (req, res, next) => {
  try {
    const bonds = await Bond.find();
    res.json(bonds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBond = async (req, res, next) => {
  try {
    const { bondType, date } = req.body;
    const bond = await Bond.findByIdAndUpdate(
      req.params.id,
      { bondType, date },
      { new: true, runValidators: true }
    );
    if (!bond) {
      return res.status(404).json({ message: "Bond not found" });
    }
    res.json(bond);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const figures = async (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const bond = new Bond(value);
    await bond.save();
    res.status(201).send({
      message: "Bond data saved successfully",
      data: bond,
    });
  } catch (err) {
    console.error("Error saving bond:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const getFiguresByFigure = async (req, res,next) => {
  const { figure } = req.params;

  try {
    const bond = await Bond.findOne({ "figures.figure": figure });

    if (!bond) {
           throw next(
             apiError.badRequest(MESSEGES.BOND_NOT_FOUND, "getFiguresByFigure")
           );
    
    }

    res.status(200).send({
      message: "Bond data retrieved successfully",
      data: {
        first: bond.figures.first,
        second: bond.figures.second,
      },
    });
  } catch (err) {
    console.error("Error retrieving bond:", err);
    res.status(500).send("Internal Server Error");
  }
};
export const purchaseFigures = async (req, res) => {
  const { error, value } = purchaseSchema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const {  figure, firstAmount, secondAmount } = value;

  const userId = req.userId;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const bond = await Bond.findOne({ "figures.figure": figure });
    if (!bond) {
      return res.status(404).send("Bond not found with the given figure");
    }

    if (
      firstAmount > bond.figures.first ||
      secondAmount > bond.figures.second
    ) {
      
      return res.status(400).send("Requested amounts exceed available figures");
    }

    const totalCost = firstAmount + secondAmount;

    if (totalCost > user.balance) {
      return res.status(400).send("Insufficient balance");
    }

    bond.figures.first -= firstAmount;
    bond.figures.second -= secondAmount;

    user.balance -= totalCost;

    await bond.save();
    await user.save();




    res.status(200).send({
      isSucess: true,
      message: " Bond Purchase successful",
      data: {
        bond: bond,
        user: user,
      },
    });
  } catch (err) {
    console.error("Error processing purchase:", err);
    res.status(500).send("Internal Server Error");
  }
};

export default {
  updateBond,
  deleteUser,
  getAllBonds,
  signIn,
  createBond,
  createNewUser,
  updateUser,
  getUsers,
  figures,
  getFiguresByFigure,
  purchaseFigures,
};
