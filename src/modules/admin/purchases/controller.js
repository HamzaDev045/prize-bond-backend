import { Bond, UserModel, priceNumber } from "../model.js";
import { Purchase } from "./model.js";

export const purchaseFigures = async (req, res) => {
  
  const { bondType, figure, firstAmount, secondAmount, date } = req.body;
  const userId = req.userId;
  try {
    const bond = await Bond.findOne({ bondType: bondType });

    if (!bond) {
      return res.status(400).json({message :"Bond not found"});
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({message :"User not found"});
    }

    const bondObject = bond.toObject();

    const parsedFigure = parseInt(figure);
    const foundFigure = bondObject.figures.find((fig) => fig?.figure === parsedFigure);

    if (!foundFigure) {
      return res.status(404).json({message :"Figure not found"});
    }

    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json({message :"Requested amounts exceed available figures"});
    }

    const totalCost = Number(firstAmount) + Number(secondAmount);
    const bondBalance = user.balance.find(b => b.bond === bondType);
    if (totalCost > bondBalance?.balance) {
      return res.status(400).json({message :"Insufficient balance"});
    }

    const figureIndex = bondObject.figures.findIndex((fig) => fig?.figure === parsedFigure);

    bondObject.figures[figureIndex].first -= firstAmount;
    bondObject.figures[figureIndex].second -= secondAmount;

    await Bond.updateOne({ bondType: bondType }, { $set: bondObject });

    const newPurchase = new Purchase({
      userId: userId,
      date: date,
      bondType: bondType,
      figures: { figure: figure, first: firstAmount, second: secondAmount },
      isNormal: true,
    });

    // user.balance -= totalCost;
    await newPurchase.save();
    // await user.save();
    await UserModel.findOneAndUpdate(
      { _id: user._id, "balance.bond": bondType },
      { $inc: { "balance.$.balance": -totalCost } },
      { new: true }
    );


    res.status(200).json({
      isSuccess: true,
      message: "Bond purchase successful",
      data: {
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
    console.error("Error processing purchase:", err);
    res.status(500).json("Internal Server Error");
  }
};

export const userPurchases = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bondType } = req.body;
    console.log(bondType ,"bondType");
    

    if (!bondType) {
      return res.status(400).json({ message: "Invalid Data" });
    }

    // const match = bondType.match(/^([A-Z]+)(\d{1,2}\/\d{1,2}\/\d{4})$/);
    const match = bondType.match(/^([A-Z:0-9]+?)(\d{1,2}\/\d{1,2}\/\d{4})$/);
    const bond = match[1];
    const date = match[2];
    if (!userId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing userId parameter.",
      });
    }

    const purchases = await Purchase.find({ userId: userId, bondType: bond, date: date });

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
        message:
          "At least one field (figure, firstAmount, secondAmount) must be provided for update.",
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
    const bondBalance = user.balance.find(b => b.bond === purchase.bondType);

    const bond = await Bond.findOne({ bondType: purchase.bondType });

    if (!bond) {
      return res.status(404).json({
        isSuccess: false,
        message: "Bond not found for this purchase.",
      });
    }

    const bondObject = bond.toObject();
    const parsedFigure = parseInt(purchase.figures.figure);
    const foundFigure = bondObject.figures.find((fig) => fig?.figure === parsedFigure)
    
    if (!foundFigure) {
      return res.status(404).json({
        isSuccess: false,
        message: "Figure not found in the bond.",
      });
    }
    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json("Requested amounts exceed available figures");
    }

    const firstDifference =
      firstAmount !== undefined ? firstAmount - purchase.figures.first : 0;
    const secondDifference =
      secondAmount !== undefined ? secondAmount - purchase.figures.second : 0;

    const totalDifference = firstDifference + secondDifference;


    if (totalDifference > 0) {
      if (totalDifference > bondBalance) {
        return res.status(400).json({
          isSuccess: false,
          message:
            "User does not have enough balance to cover the additional cost.",
        });
      }
      await UserModel.findOneAndUpdate(
        { _id: user._id, "balance.bond": purchase.bondType },
        { $inc: { "balance.$.balance": -totalDifference } },
        { new: true }
      );
    } else if (totalDifference < 0) {
      await UserModel.findOneAndUpdate(
        { _id: user._id, "balance.bond": purchase.bondType },
        { $inc: { "balance.$.balance": +Math.abs(totalDifference)} },
        { new: true }
      );
    }

    if (firstAmount !== undefined) {
      foundFigure.first += -firstDifference;
    }
    if (secondAmount !== undefined) {
      foundFigure.second += -secondDifference;
    }

    await Bond.updateOne({ bondType: purchase.bondType }, { $set: bondObject });

    const updateData = {
      ...(figure !== undefined && { "figures.figure": figure }),
      ...(firstAmount !== undefined && { "figures.first": firstAmount }),
      ...(secondAmount !== undefined && { "figures.second": secondAmount }),
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
      updatedBalance: bondBalance,
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

    const refundAmount = purchase.figures.first + purchase.figures.second;

    // user.balance += refundAmount;
    // await user.save();
    await UserModel.findOneAndUpdate(
      { _id: user._id, "balance.bond": purchase.bondType },
      { $inc: { "balance.$.balance": +refundAmount } },
      { new: true }
    );
    

    const bond = await Bond.findOne({ bondType: purchase.bondType });

    if (!bond) {
      return res.status(404).json({
        isSuccess: false,
        message: "Bond not found associated with this purchase.",
      });
    }

    const bondObject = bond.toObject();

    const parsedFigure = parseInt(purchase.figures.figure);
    const foundFigure = bondObject.figures.find((fig) => fig?.figure === parsedFigure)

    if (!foundFigure) {
      return res.status(404).json({
        isSuccess: false,
        message: "Figure not found in the bond.",
      });
    }


    const figureIndex = bondObject.figures.findIndex((fig) => fig?.figure === parsedFigure);

    bondObject.figures[figureIndex].first += purchase.figures.first;
    bondObject.figures[figureIndex].second += purchase.figures.second;

    await Bond.updateOne({ bondType: purchase.bondType }, { $set: bondObject });

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
  const { bondType, figure, firstAmount, secondAmount, date } = req.body;
  const { userId } = req.params;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }
    const bond = await Bond.findOne({ bondType: bondType });
    if (!bond) {
      return res.status(400).json({message :"Bond not found"});
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({message :"User not found"});
    }

    const bondObject = bond.toObject();

    const parsedFigure = parseInt(figure);
    const foundFigure = bondObject.figures.find((fig) => fig?.figure === parsedFigure);

    
    if (!foundFigure) {
      return res.status(404).json({message :"Figure not found"});
    }

    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json({message :"Requested amounts exceed available figures"});
    }

    const totalCost = Number(firstAmount) + Number(secondAmount);
    const bondBalance = user.balance.find(b => b.bond === bondType);

    if (totalCost > bondBalance?.balance) {
      return res.status(400).json({message :"Insufficient balance"});
    }

    const figureIndex = bondObject.figures.findIndex((fig) => fig?.figure === parsedFigure);

    bondObject.figures[figureIndex].first -= firstAmount;
    bondObject.figures[figureIndex].second -= secondAmount;

    await Bond.updateOne({ bondType: bondType }, { $set: bondObject });

    const updatedBond = await Bond.findOne({ bondType: bondType });

    const newPurchase = new Purchase({
      userId: userId,
      date: date,
      bondType: bondType,
      figures: { figure: figure, first: firstAmount, second: secondAmount },
      isNormal: false,
    });

    await newPurchase.save();
    await UserModel.findOneAndUpdate(
      { _id: user._id, "balance.bond": bondType },
      { $inc: { "balance.$.balance": -totalCost } },
      { new: true }
    );

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


export const processBondFigures = async (req, res) => {
  const { bondType, userId } = req.body;

  if (!bondType || !userId) {
    return res.status(400).json({ message: "Invalid Data" });
  }
  const match = bondType.match(/^([A-Z]+)\s*(\d{1,2}\/\d{1,2}\/\d{4})$/);
  const bond = match[1];
  const date = match[2];

  try {
    const purchasesData = await Purchase.find({
      bondType: bond,
      date: date,
      userId,
    }).populate("userId");
    const user = await UserModel.findOne({ _id: userId });
    const numberdata = await priceNumber.findOne({
      bondType: bond,
      date: date
    });
    if (!numberdata) {
      return res
        .status(400)
        .json({ message: "This Bond Winner is not Decided yet" });
    }
    const winArray = numberdata?.numbers;
    const results = {
      normal: {
        total: 0,
        commission: 0,
        remain: 0,
      },
    };

    function calculateCommissionAndRemain(total, figureLength) {
      let commissionRate = 0;
      if (figureLength === 1 || figureLength === 2 || figureLength === 3) {
        commissionRate = user?.initialFigureCommision / 100;
      } else if (figureLength === 4) {
        commissionRate = user?.forthFigureCommision / 100;
      }

      const commission = total * commissionRate;
      const remain = total - commission;

      return { commission, remain };
    }

    // Process each bond in the data
    purchasesData.forEach((bond) => {
      const total = bond.figures.first + bond.figures.second;
      const figureLength = bond.figures.figure.toString().length;
      const { commission, remain } = calculateCommissionAndRemain(
        total,
        figureLength
      );

      results.normal.total += total;
      results.normal.commission += commission;
      results.normal.remain += remain;
    });

    let totalPrize = 0;

    winArray.forEach((win) => {
      const matchingFigure = purchasesData.find(
        (item) => item?.figures?.figure === win?.figure
      );

      if (matchingFigure) {
        // winningFigure = [...winningFigure ,matchingFigure ]
        const figureType = matchingFigure?.figures?.figure?.toString().length;

        let prize = 0;

        switch (figureType) {
          case 1:
            prize =
              win?.inam === "first"
                ? matchingFigure?.figures?.first * 7
                : (matchingFigure?.figures?.second * 7) /
                (bondType === "GTL" || bondType === "PB:200" ? 5 : 3);
            break;
          case 2:
            prize =
              win?.inam === "first"
                ? matchingFigure?.figures?.first * 70
                : (matchingFigure?.figures?.second * 70) /
                (bondType === "GTL" || bondType === "PB:200" ? 5 : 3);
            break;
          case 3:
            prize =
              win?.inam === "first"
                ? matchingFigure?.figures?.first * 700
                : (matchingFigure?.figures?.second * 700) /
                (bondType === "GTL" || bondType === "PB:200" ? 5 : 3);
            break;
          case 4:
            prize =
              win?.inam === "first"
                ? matchingFigure?.figures?.first * 5000
                : (matchingFigure?.figures?.second * 5000) /
                (bondType === "GTL" || bondType === "PB:200" ? 5 : 3);
            break;
          default:
            break;
        }

        totalPrize += prize;
      }
    });

    return res.send({
      totalPurchasedAmount: results?.normal?.total,
      PurchasedAmountCommission: results?.normal?.commission,
      purchasedAmountRemaning: results?.normal?.remain,
      totalPrize,
      overAll: totalPrize - results?.normal?.remain,
    });
  } catch (error) {
    console.error("Error processing bond figures:", error);
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
  adminPurchaseFigures,
  processBondFigures,
};
