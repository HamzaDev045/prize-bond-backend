
import { Bond, UserModel } from "../model.js"
import { Purchase } from "./model.js";



export const purchaseFigures = async (req, res) => {
  const { bondType, figure, firstAmount, secondAmount } = req.body;
  const userId = req.userId;
  try {
    const bond = await Bond.findOne({ bondType: bondType });

    if (!bond) {
      return res.status(400).json("Bond not found");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    const bondObject = bond.toObject();

    const figureLength = String(figure).length;

    const foundFigure = bondObject.figures.find(f => String(f.figure).length === figureLength);

    if (!foundFigure) {
      return res.status(404).json("Figure not found");
    }

    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json("Requested amounts exceed available figures");
    }

    const totalCost =  Number(firstAmount) + Number(secondAmount);


    if (totalCost > user.balance) {
      return res.status(400).json("Insufficient balance");
    }

    const newFirstValue = foundFigure.first - firstAmount;
    const newSecondValue = foundFigure.second - secondAmount;

    const indexToUpdate = figureLength - 1

    bondObject.figures[indexToUpdate].first = newFirstValue
    bondObject.figures[indexToUpdate].second = newSecondValue


 await Bond.updateOne(
      { bondType: bondType },
      { $set: bondObject }
    );

    const updatedBond = await Bond.findOne({ bondType: bondType });

    const newPurchase = new Purchase({
      userId: userId,
      bondType:bondType,
      figures: {figure :figure , first:firstAmount  , second: secondAmount},
      isNormal: true
    });

    user.balance -= totalCost;
    await newPurchase.save();
    await user.save();


    res.status(200).json({
      isSuccess: true,
      message: "Bond purchase successful",
      data: {
        bond: updatedBond,
        user: user.balance,
      },
    });
  } catch (err) {
    console.error("Error processing purchase:", err);
    res.status(500).json("Internal Server Error");
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find();

    if (!purchases || purchases.length === 0) {
      return res.status(404).json("No purchases found.");
    }

    res.status(200).json({
      isSuccess: true,
      message: "Purchases retrieved successfully",
      data: purchases,
    });
  } catch (err) {
    console.error("Error processing purchase:", err);
    res.status(500).json("Internal Server Error");
  }
};

export const userPurchases = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing userId parameter.",
      });
    }

    const purchases = await Purchase.find({ userId: userId });

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        message: "No purchases found for this user.",
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: "User purchases retrieved successfully",
      data: purchases,
    });
  } catch (err) {
    console.error("Error retrieving user purchases:", err);
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};



export const SingleuserPurchases = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing purchaseId parameter.",
      });
    }

    const purchase = await Purchase.findOne({ _id: purchaseId });

    if (!purchase) {
      return res.status(404).json({
        isSuccess: false,
        message: "No purchase found with the given ID.",
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: "Purchase retrieved successfully",
      data: purchase,
    });
  } catch (err) {
    console.error("Error retrieving purchase:", err);
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};



export const updateSinglePurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { figure, firstAmount, secondAmount } = req.body;

    if (!purchaseId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing purchaseId parameter.",
      });
    }

    if (!figure && !firstAmount && !secondAmount) {
      return res.status(400).json({
        isSuccess: false,
        message: "At least one field (figure, firstAmount, secondAmount) must be provided for update.",
      });
    }

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({
        isSuccess: false,
        message: "No purchase found with the given ID.",
      });
    }

    const user = await UserModel.findById(purchase.userId);
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: "User not found for this purchase.",
      });
    }

    const bond = await Bond.findOne({ bondType: purchase.bondType });

    if (!bond) {
      return res.status(404).json({
        isSuccess: false,
        message: "Bond not found for this purchase.",
      });
    }

    const bondObject = bond.toObject();
    const figureLength = String(purchase.figures.figure).length;

    const foundFigure = bondObject.figures.find(f => String(f.figure).length === figureLength);

    if (!foundFigure) {
      return res.status(404).json({
        isSuccess: false,
        message: "Figure not found in the bond.",
      });
    }

    const firstDifference = firstAmount !== undefined ? firstAmount - purchase.figures.first : 0;
    const secondDifference = secondAmount !== undefined ? secondAmount - purchase.figures.second : 0;

    const totalDifference = firstDifference + secondDifference;

    if (totalDifference > 0) {
      if (totalDifference > user.balance) {
        return res.status(400).json({
          isSuccess: false,
          message: "User does not have enough balance to cover the additional cost.",
        });
      }
      user.balance -= totalDifference;
    } else if (totalDifference < 0) {
      user.balance += Math.abs(totalDifference);
    }

    if (firstAmount !== undefined) {
      foundFigure.first += -firstDifference;
    }
    if (secondAmount !== undefined) {
      foundFigure.second += -secondDifference; 
    }

    await user.save();

    await Bond.updateOne(
      { bondType: purchase.bondType },
      { $set: bondObject }
    );

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
      return res.status(404).json({
        isSuccess: false,
        message: "No purchase found with the given ID.",
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: "Purchase and bond updated successfully",
      data: updatedPurchase,
      updatedBalance: user.balance,
    });
  } catch (err) {
    console.error("Error updating purchase:", err);
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};



export const deleteSinglePurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing purchaseId parameter.",
      });
    }


    const purchase = await Purchase.findById(purchaseId);


    const user = await UserModel.findById(purchase.userId);

    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: "No user found for this purchase.",
      });
    }

    const refundAmount = purchase.figures.first+purchase.figures.second; 
    

    
    user.balance += refundAmount; 
    await user.save()

     const bond = await Bond.findOne({ bondType: purchase.bondType });

     if (!bond) {
       return res.status(404).json({
         isSuccess: false,
         message: "Bond not found associated with this purchase.",
       });
     }
 
     const bondObject = bond.toObject();
     const figureLength = String(purchase.figures.figure).length;
 
     const foundFigure = bondObject.figures.find(f => String(f.figure).length === figureLength);
     
     if (!foundFigure) {
       return res.status(404).json({
         isSuccess: false,
         message: "Figure not found in the bond.",
       });
     }
 
     // Re-add the 'first' and 'second' values back to the bond
     foundFigure.first += purchase.figures.first; // add back the 'first' value
     foundFigure.second += purchase.figures.second; // add back the 'second' value
 
     // Update the bond with the re-added values
     await Bond.updateOne(
       { bondType: purchase.bondType },
       { $set: bondObject }
     );

    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
      

    if (!deletedPurchase) {
      return res.status(404).json({
        isSuccess: false,
        message: "No purchase found with the given ID.",
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: "Purchase deleted successfully",
      data: deletedPurchase,
    });
  } catch (err) {
    console.error("Error deleting purchase:", err);
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};


export const adminPurchaseFigures = async (req, res) => {

  const {bondType, figure, firstAmount, secondAmount } = req.body;

  const { userId } = req.params

  try {
    const bond = await Bond.findOne({ bondType: bondType });

    if (!bond) {
      return res.status(400).json("Bond not found");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    const bondObject = bond.toObject();

    const figureLength = String(figure).length;


    const foundFigure = bondObject.figures.find(f => String(f.figure).length === figureLength);

    if (!foundFigure) {
      return res.status(404).json("Figure not found");
    }

    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json("Requested amounts exceed available figures");
    }
    
    const totalCost =  Number(firstAmount) + Number(secondAmount);
    if (totalCost > user.balance) {
      return res.status(400).json("Insufficient balance");
    }

    const newFirstValue = foundFigure.first - firstAmount;
    const newSecondValue = foundFigure.second - secondAmount;

    const indexToUpdate = figureLength - 1


    bondObject.figures[indexToUpdate].first = newFirstValue
    bondObject.figures[indexToUpdate].second = newSecondValue


 await Bond.updateOne(
      { bondType: bondType },
      { $set: bondObject }
    );

    const updatedBond = await Bond.findOne({ bondType: bondType });


    const newPurchase = new Purchase({
      userId: userId,
      figures: foundFigure,
      isNormal: false
    });


    user.balance -= totalCost;
    await newPurchase.save();
    await user.save();


    res.status(200).json({
      isSuccess: true,
      message: "Bond purchase successful",
      data: {
        bond: updatedBond,
        user: user.balance,
      },
    });
  } catch (err) {
    console.error("Error processing purchase:", err);
    res.status(500).json("Internal Server Error");
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
