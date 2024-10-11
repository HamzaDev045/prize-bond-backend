import {
        purchaseSchema,
  } from "./validation.js";
  
 
  import {UserModel} from "../model.js"
import { Purchase } from "./model.js";
  

  export const purchaseFigures = async (req, res) => {
    const { error, value } = purchaseSchema.validate(req.body);
  
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
  
    const { figure, firstAmount, secondAmount } = value;
  
    const userId = req.userId;
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      const bond = await Purchase.findOne({ "figures.figure": figure });
      if (!bond) {
        return res.status(404).send("Bond not found with the given figure");
      }
  
      if (
        firstAmount > bond.figures.first ||
        secondAmount > bond.figures.second
      ) {
        return res.status(400).send("Requested amounts exceed available figures");
      }
  
      const totalCost = firstAmount + secondAmount;
  
      if (totalCost > user.balance) {
        return res.status(400).send("Insufficient balance");
      }
  
      bond.figures.first -= firstAmount;
      bond.figures.second -= secondAmount;
      bond.userId = userId;
  
      user.balance -= totalCost;
  
      await bond.save();
      await user.save();
  
      res.status(200).send({
        isSucess: true,
        message: " Bond Purchase successful",
        data: {
          bond: bond,
          user: user,
        },
      });
    } catch (err) {
      console.error("Error processing purchase:", err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  export const getAllPurchases = async (req, res) => {
    try {
      const purchases = await Purchase.find ();
  
      if (!purchases || purchases.length === 0) {
        return res.status(404).send("No purchases found.");
      }
  
      res.status(200).send({
        isSuccess: true,
        message: "Purchases retrieved successfully",
        data: purchases,
      });
    } catch (err) {
      console.error("Error processing purchase:", err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  export const userPurchases = async (req, res) => {
    try {
      const userId = req.query;
  
      const purchases = await Purchase.find({ userId });
  
      if (!purchases || purchases.length === 0) {
        return res.status(404).send({
          isSuccess: false,
          message: "No purchases found for this user.",
        });
      }

      res.status(200).send({
        isSuccess: true,
        message: "User purchases retrieved successfully",
        data: purchases,
      });
    } catch (err) {
      console.error("Error retrieving user purchases:", err);
      res.status(500).send({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  };
  


  export const SingleuserPurchases = async (req, res) => {
    try {
      const { purchaseId } = req.query;
  
      if (!purchaseId) {
        return res.status(400).send({
          isSuccess: false,
          message: "Missing purchaseId parameter.",
        });
      }
  
      const purchase = await Purchase.findOne({ _id: purchaseId });
  
      if (!purchase) {
        return res.status(404).send({
          isSuccess: false,
          message: "No purchase found with the given ID.",
        });
      }
  
      res.status(200).send({
        isSuccess: true,
        message: "Purchase retrieved successfully",
        data: purchase,
      });
    } catch (err) {
      console.error("Error retrieving purchase:", err);
      res.status(500).send({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  };
  


  export const updateSinglePurchase = async (req, res) => {
    try {
      const { purchaseId } = req.query;
      const { figure, firstAmount, secondAmount } = req.body;
  
      if (!purchaseId) {
        return res.status(400).send({
          isSuccess: false,
          message: "Missing purchaseId parameter.",
        });
      }
  
      if (!figure && !firstAmount && !secondAmount) {
        return res.status(400).send({
          isSuccess: false,
          message: "At least one field (figure, firstAmount, secondAmount) must be provided for update.",
        });
      }
  
      const updateData = {
        ...(figure !== undefined && { 'figures.figure': figure }),
        ...(firstAmount !== undefined && { 'figures.first': firstAmount }),
        ...(secondAmount !== undefined && { 'figures.second': secondAmount }),
      };
  
      const updatedPurchase = await Purchase.findByIdAndUpdate(
        purchaseId,
        { $set: updateData },
        { new: true } 
      );
  
      if (!updatedPurchase) {
        return res.status(404).send({
          isSuccess: false,
          message: "No purchase found with the given ID.",
        });
      }
  
      res.status(200).send({
        isSuccess: true,
        message: "Purchase updated successfully",
        data: updatedPurchase,
      });
    } catch (err) {
      console.error("Error updating purchase:", err);
      res.status(500).send({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  };


  export const deleteSinglePurchase = async (req, res) => {
    try {
      const { purchaseId } = req.query;
  
      if (!purchaseId) {
        return res.status(400).send({
          isSuccess: false,
          message: "Missing purchaseId parameter.",
        });
      }
  
      const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
  
      if (!deletedPurchase) {
        return res.status(404).send({
          isSuccess: false,
          message: "No purchase found with the given ID.",
        });
      }
  
      res.status(200).send({
        isSuccess: true,
        message: "Purchase deleted successfully",
        data: deletedPurchase,
      });
    } catch (err) {
      console.error("Error deleting purchase:", err);
      res.status(500).send({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  };
  
  
  export const adminPurchaseFigures = async (req, res) => {
    const { error, value } = purchaseSchema.validate(req.body);
  
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
  
    const { figure, firstAmount, secondAmount, userId } = value; 
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      const bond = await Purchase.findOne({ "figures.figure": figure });
      if (!bond) {
        return res.status(404).send("Bond not found with the given figure");
      }
  
      if (
        firstAmount > bond.figures.first ||
        secondAmount > bond.figures.second
      ) {
        return res.status(400).send("Requested amounts exceed available figures");
      }
  
      bond.figures.first -= firstAmount;
      bond.figures.second -= secondAmount;
      bond.userId = userId; 
      bond.isNormal=false
  
  
      await bond.save();
  
      res.status(200).send({
        isSuccess: true,
        message: "Bond purchase successful by admin for the user",
        data: {
          bond: bond,
          user: user,
        },
      });
    } catch (err) {
      console.error("Error processing admin purchase:", err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  
  export default {
    purchaseFigures,
    getAllPurchases,
    userPurchases,
    SingleuserPurchases,
    updateSinglePurchase,
    deleteSinglePurchase,
    adminPurchaseFigures

  };
  