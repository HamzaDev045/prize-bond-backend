import { Router } from 'express'
import controller from './controller.js'
import   isAuthorized  from '../../../middleware/auth.js'
import {isAdmin} from "../../../middleware/isAdmin.js"



const router = Router()

router



// Purchases :=
  .post("/figures/purchase", isAuthorized, controller.purchaseFigures)  //done tested

  .get("/all-purchases", isAuthorized,isAdmin, controller.getAllPurchases) //done tested

  .get("/user-purchases/:userId", isAuthorized, controller.userPurchases) //done tested

  .get("/single-user-purchases/:purchaseId", isAuthorized,isAdmin, controller.SingleuserPurchases) //done tested

  .put("/update-purchases/:purchaseId", isAuthorized,isAdmin, controller.updateSinglePurchase) //done tested


  .post("/admin-purchase/:userId", isAuthorized, controller.adminPurchaseFigures)  //done tested

  .delete("/delete-purchases/:purchaseId", isAuthorized,isAdmin, controller.deleteSinglePurchase) //done tested

 

export default router

