import { Router } from 'express'
import controller from './controller.js'
import   isAuthorized  from '../../../middleware/auth.js'
import {isAdmin} from "../../../middleware/isAdmin.js"



const router = Router()

router



// Purchases :=
  .post("/figures/purchase", isAuthorized, controller.purchaseFigures)

  .get("/all-purchases", isAuthorized,isAdmin, controller.getAllPurchases)

  .get("/user-purchases/:id", isAuthorized, controller.userPurchases)

  .get("/single-user-purchases/:id", isAuthorized,isAdmin, controller.SingleuserPurchases)

  .put("/update-purchases/:id", isAuthorized,isAdmin, controller.updateSinglePurchase)


  .post("/admin-purchase", isAuthorized, controller.adminPurchaseFigures)




  .delete("/delete-purchases/:id", isAuthorized,isAdmin, controller.deleteSinglePurchase)

 

export default router

