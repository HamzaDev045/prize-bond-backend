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
  .get("/user/:userId", isAuthorized,  controller.getOneUserDetail)
  .get("/users", isAuthorized, isAdmin, controller.getUsers)

  // Bonds
  .post("/addBond", isAuthorized, isAdmin, controller.createBond)
  .put("/bonds/:id", isAuthorized, isAdmin, controller.updateBond)
  .put("/bondstatus/:id", isAuthorized, isAdmin, controller.activateBond)

  .get("/allBonds", isAuthorized, isAdmin, controller.getAllBonds)
  .get("/userBonds", isAuthorized,  controller.getUserBonds)

  .post("/create-figures", isAuthorized, isAdmin, controller.figures)
  .get("/figures/:figure/:bondType", isAuthorized, isAdmin, controller.getFiguresByFigure)


  .post("/figures/purchase", isAuthorized, controller.purchaseFigures)



  // .post("/admin-purchase", isAuthorized, controller.adminPurchaseFigures)


  // .get("/all-purchases", isAuthorized,isAdmin, controller.getAllPurchases)

  // .put("/update-purchases/:id", isAuthorized,isAdmin, controller.updateSinglePurchase)

  // .delete("/delete-purchases/:id", isAuthorized,isAdmin, controller.updateSinglePurchase)

  // .get("/single-user-purchases/:id", isAuthorized,isAdmin, controller.SingleuserPurchases)

  // .get("/user-purchases/:id", isAuthorized, controller.userPurchases)

 
 

export default router

