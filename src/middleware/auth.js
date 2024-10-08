import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "../modules/admin/model.js";

import { apiError, verifyJwtToken } from "../utils/index.js";
import { MESSEGES } from "../constants/index.js";
import { getUserByConditions } from "../modules/admin/services.js";
const isAuthorized = async (req, res, next) => {
  try {
    const bearer = req?.headers?.authorization;
    if (!bearer) {
      res.status(404);
      return next(
        apiError.badRequest(MESSEGES.AUTHORIZATION_INVALID, "isAuthorized")
      );
    }


    const token = bearer.split(" ")[1] || "";
    if (!token) {
      return next(
        apiError.badRequest(
          MESSEGES.AUTHORIZATION_TOKEN_NOT_FOUND,
          "isAuthorized"
        )
      );
    }


    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.role) {
      return next(apiError.badRequest(MESSEGES.TOKEN_INVALID, "isAuthorized"));
    }

    const decodeUser = await verifyJwtToken(token, decodedToken.role);

    if (!decodeUser)
      return next(
        apiError.badRequest(MESSEGES.TOKEN_NOT_VERIFIED, "isAuthorized")
      );

      
    const email = decodeUser?.email;
    
    if (!email)

      return next(
        apiError.badRequest(MESSEGES.EMAIL_NOT_FOUND, "isAuthorized")
      );


    const user = await UserModel.findOne({ email: email });
    // if (!user) {
    //   return next(
    //     apiError.badRequest(MESSEGES.USERNAME_NOT_FOUND, "isAuthorized")
    //   );
    // }

    req.userId = new mongoose.Types.ObjectId(user?._id);
    req.user = user;
    req.userRole = user?.role;
    next();
  } catch (error) {
    console.log("Error:", error);
    return next(
      apiError.badRequest(
        error?.message === "jwt expired"
          ? MESSEGES.TOKEN_EXPIRED
          : MESSEGES.TOKEN_INVALID,
        "verifyJwtToken"
      )
    );
  }
};

export default isAuthorized;


