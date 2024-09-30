import mongoose from "mongoose";

import { apiError, verifyJwtToken } from "../utils/index.js";
import { MESSEGES } from "../constants/index.js";
import { getUserByConditions } from "../modules/admin/services.js";

const isAdmin = async (req, res, next) => {
  try {
 
    const { username } = req.body; 
    if (!username) {
      return next(
        apiError.badRequest(MESSEGES.USERNAME_MISSING, "isAuthorized")
      );
    }

    const user = await getUserByConditions({ username });

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USERNAME_NOT_FOUND, "isAuthorized")
      );
    }


if(user?.role !="admin"){
  return next(
    apiError.badRequest(MESSEGES.UNAUTHORIZED_ROLE, "isAuthorized")
  );
}
    next();
  } catch (error) {
    console.log(error, "errror");
    return next(
      apiError.badRequest(
        error?.message === "jwt expired"
          ? MESSEGES.TOKEN_EXPIRED
          : MESSEGES.TOKEN_INVALID,
        "authMiddleware "
      )
    );
  }
};

export default isAdmin;
