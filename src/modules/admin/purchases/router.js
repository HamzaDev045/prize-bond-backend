import { Router } from 'express'
import controller from './controller.js'
import isAuthorized from '../../../middleware/auth.js'
import { isAdmin } from "../../../middleware/isAdmin.js"



const router = Router()

router



  // Purchases :=
  .post("/figures/purchase", isAuthorized, controller.purchaseFigures)  //done 
  // isAuthorized, isAdmin,
  .get("/all-purchases/:userId",  controller.getAllPurchases) //done

  .post("/user-purchases/:userId", isAuthorized, controller.userPurchases) //done
  .post("/user-ledger/:userId", isAuthorized, controller.userledger)
  .get("/single-user-purchases/:purchaseId", isAuthorized, isAdmin, controller.SingleuserPurchases) //done tested

  .put("/update-purchases/:purchaseId", isAuthorized, isAdmin, controller.updateSinglePurchase) //done tested


  .post("/admin-purchase/:userId", isAuthorized, controller.adminPurchaseFigures)  //done

  .delete("/delete-purchases/:purchaseId", isAuthorized, isAdmin, controller.deleteSinglePurchase) //done tested
  .post("/price-purchases", controller.processBondFigures) //done tested for sheet to check passy layna hayn ka dayna hayn







export default router

