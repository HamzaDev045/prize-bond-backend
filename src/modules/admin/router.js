import { Router } from 'express'
import controller from './controller.js'
import { isAdmin, isAuthorized } from '../../middleware/index.js'



const router = Router()

router

  // Users
  .post("/signin", controller.signIn)
  .post("/create-user", isAuthorized, isAdmin, controller.createNewUser)
  .delete("/delete-user/:id", isAuthorized, isAdmin, controller.deleteUser)
  .put("/update-user/:userId", isAuthorized, isAdmin, controller.updateUser)
  .get("/users", isAuthorized, isAdmin, controller.getUsers)

  // Bonds
  .post("/addBond", isAuthorized, isAdmin, controller.createBond)
  .put("/bondstatus/:id", isAuthorized, isAdmin, controller.activateBond)
  .put("/bonds/:id", isAuthorized, isAdmin, controller.updateBond)
  .get("/allBonds", isAuthorized, isAdmin, controller.getAllBonds)
  .post("/create-figures", isAuthorized, isAdmin, controller.figures)
  .get("/figures/:figure", isAuthorized, isAdmin, controller.getFiguresByFigure)
  .post("/figures/purchase", isAuthorized, controller.purchaseFigures);


 
 

export default router

