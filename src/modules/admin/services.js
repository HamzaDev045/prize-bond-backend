import { UserModel } from "./model.js";
import { apiError } from "../../utils/index.js";
import { MESSEGES } from "../../constants/index.js";

export const getUserByConditions = async (condition, removeFields = "") => {
  return await UserModel.findOne({ ...condition }).select(removeFields); // .populate(populateBy)
};



// Update user data
export const updateUserbyId = async (userId, updateData) => {
  return await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
};


export const getAllUser = async (skip, limit) => {
  return await UserModel.find({ role: "user" }).skip(skip).limit(limit);
};
export const updateUserByCondition = async (condition, data) => {
  return await UserModel.findOneAndUpdate({ ...condition }, data, {
    new: true,
  });
};

export const createUser = async (data, next) => {

  const existingUser = await getUserByConditions({ username: data.username });
 

  if (existingUser) {
    throw next(
      apiError.badRequest(MESSEGES.USER_ALREADY_EXIST_MESSAGE, "signup")
    );
  }
  const savedUser=await UserModel.create(data);
  // console.log(savedUser,"saved USer");
  
  return await savedUser;
};

// export const updateUser = async (
//   data,
//   next
// ) => {
//   return await UserModel.findOneAndUpdate({ _id: data.userId }, data)
// }

export const updateUserById = async (userId, data, next) => {
  const user = await getUserById(userId);
  if (!user) {
    next(apiError.badRequest(MESSEGES.USERNAME_NOT_FOUND, "updateUser"));
  }

  const mongooseUserId = new Types.ObjectId(userId);

  return await UserModel.findOneAndUpdate({ _id: mongooseUserId }, data);
};

export const deleteUserById = async (data) => {
  return await UserModel.findOneAndDelete({ _id: data.userId });
};

export const getAllUsersByConditionsByRole = async (
  condition,
  skip,
  limit,
  removeFields = ""
) => {
  return await UserModel.find(condition)
    .skip(skip)
    .limit(limit)
    .populate("roleId", "name");
};

export const countUsersByCondition = async () => {
  return await UserModel.countDocuments({role:"user"});
};
