import { Router } from 'express'
import controller from './controller.js'
import { isAdmin, isAuthorized } from '../../middleware/index.js'



const router = Router()

router

  .post("/signup", controller.signUp)
  .post("/signin", controller.signIn)
  // .post("/create-user", isAuthorized,isAdmin, controller.createNewUser)
  .post("/create-user", isAuthorized, controller.createNewUser)
  .put("/update-balance", controller.updateBalance)
  .get("/users", controller.getUsers);
 

export default router

