import { Router } from 'express'
import controller from './controller.js'
import { isAdmin, isAuthorized } from '../../middleware/index.js'



const router = Router()

router

  // .post("/signup", controller.signUp)
  .post("/signin", controller.signIn)
  .post("/create-user", isAuthorized, isAdmin, controller.createNewUser)
  .put("/update-user/:userId", isAuthorized, isAdmin, controller.updateUser)
  .get("/users", controller.getUsers);
 

export default router

