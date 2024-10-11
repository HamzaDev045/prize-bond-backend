import { UserModel } from "./model.js";
import { apiError } from "../../utils/index.js";
import { MESSEGES } from "../../constants/index.js";

export const getUserByConditions = async (condition, removeFields = "") => {
  return await UserModel.findOne({ ...condition }).select(removeFields); // .populate(populateBy)
};








export const updateUserById = async (userId, data, next) => {
  const user = await getUserById(userId);
  if (!user) {
    next(apiError.badRequest(MESSEGES.USERNAME_NOT_FOUND, "updateUser"));
  }

  const mongooseUserId = new Types.ObjectId(userId);

  return await UserModel.findOneAndUpdate({ _id: mongooseUserId }, data);
};



