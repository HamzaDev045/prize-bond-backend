import { Bond, UserModel, priceNumber } from "../model.js";
import { Purchase } from "./model.js";

export const purchaseFigures = async (req, res) => {
  
  const { bondType, figure, firstAmount, secondAmount, date } = req.body;
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

    const parsedFigure = parseInt(figure);
    const foundFigure = bondObject.figures.find((fig) => fig?.figure === parsedFigure);

    if (!foundFigure) {
      return res.status(404).json("Figure not found");
    }

    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json("Requested amounts exceed available figures");
    }

    const totalCost = Number(firstAmount) + Number(secondAmount);

    if (totalCost > user.balance) {
      return res.status(400).json("Insufficient balance");
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

    user.balance -= totalCost;
    await newPurchase.save();
    await user.save();

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
    // const purchases = await Purchase.find();

    // if (!purchases || purchases.length === 0) {
    //   return res.status(404).json("No purchases found.");
    // }

    // res.status(200).json({
    //   isSuccess: true,
    //   message: "Purchases retrieved successfully",
    //   data: purchases,
    // });

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
    console.log(bond ,"bond");
    console.log(date ,"date");



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

    const firstDifference =
      firstAmount !== undefined ? firstAmount - purchase.figures.first : 0;
    const secondDifference =
      secondAmount !== undefined ? secondAmount - purchase.figures.second : 0;

    const totalDifference = firstDifference + secondDifference;

    if (totalDifference > 0) {
      if (totalDifference > user.balance) {
        return res.status(400).json({
          isSuccess: false,
          message:
            "User does not have enough balance to cover the additional cost.",
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

    const refundAmount = purchase.figures.first + purchase.figures.second;

    user.balance += refundAmount;
    await user.save();

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
    const bond = await Bond.findOne({ bondType: bondType });

    if (!bond) {
      return res.status(400).json("Bond not found");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    const bondObject = bond.toObject();

    const parsedFigure = parseInt(figure);
    const foundFigure = bondObject.figures.find((fig) => fig?.figure === parsedFigure);

    if (!foundFigure) {
      return res.status(404).json("Figure not found");
    }

    if (firstAmount > foundFigure.first || secondAmount > foundFigure.second) {
      return res.status(400).json("Requested amounts exceed available figures");
    }

    const totalCost = Number(firstAmount) + Number(secondAmount);

    if (totalCost > user.balance) {
      return res.status(400).json("Insufficient balance");
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

// export const processBondFigures = async (req, res) => {
//   const { bondType,userId } = req.body;

//   try {
//     const purchasesData = await Purchase.find({ bondType: bondType , userId}).populate("userId");
//     const user = await UserModel.findOne({_id:userId})
//   const win = {figure:123 , inam:"second"}
//     const results = {
//       normal: {
//         total: 0,
//         commission: 0,
//         remain: 0
//       }
//     };
//     // Function to calculate commission and remaining value
//     function calculateCommissionAndRemain(total, figureLength) {
//       let commissionRate = 0;
//       if (figureLength === 1 || figureLength === 2 || figureLength === 3) {
//         commissionRate = user?.initialFigureCommision / 100;
//       } else if (figureLength === 4) {
//         commissionRate = user?.forthFigureCommision / 100;
//       }

//       const commission = total * commissionRate;
//       const remain = total - commission;

//       return { commission, remain };
//     }
//     // Process each bond in the data
//     purchasesData.forEach(bond => {
//       const total = bond.figures.first + bond.figures.second;
//       const figureLength = bond.figures.figure.toString().length;
//       const { commission, remain } = calculateCommissionAndRemain(total, figureLength);

//         results.normal.total += total;
//         results.normal.commission += commission;
//         results.normal.remain += remain;
//     });

//     const figure = purchasesData?.find((item)=>item?.figures?.figure === win?.figure)
// let totalPrize
//   if(figure){
//    const figureType =  figure?.figures?.figure?.toString().length
//    console.log(figureType, 'figureType')
//    switch (figureType) {
//     case 1:
//     if(win?.inam === "first"){
//     totalPrize =  figure?.figures?.first * 7
//     }else if (win?.inam === "second"){
//       if(bondType === "GTL" || bondType === "PB:200"){
//         totalPrize =  (figure?.figures?.second * 7 ) / 5
//       }else
//       totalPrize =  (figure?.figures?.second * 7 ) / 3
//     }
//       break;
//       case 2:
//         if(win?.inam === "first"){
//           totalPrize =  figure?.figures?.first * 70
//           }else if (win?.inam === "second"){
//             if(bondType === "GTL" || bondType === "PB:200"){
//               totalPrize =  (figure?.figures?.second * 70 ) / 5
//             }else
//             totalPrize =  (figure?.figures?.second * 70 ) / 3
//           }
//       break;
//       case 3:
//         if(win?.inam === "first"){
//           totalPrize =  figure?.figures?.first * 700
//           }else if (win?.inam === "second"){
//             if(bondType === "GTL" || bondType === "PB:200"){
//               totalPrize =  (figure?.figures?.second * 700) / 5
//             }else
//             totalPrize =  (figure?.figures?.second * 700 ) / 3
//           }
//       break;
//       case 4:
//         if(win?.inam === "first"){
//           totalPrize =  figure?.figures?.first * 5000
//           }else if (win?.inam === "second"){
//             if(bondType === "GTL" || bondType === "PB:200"){
//               totalPrize =  (figure?.figures?.second * 5000) / 5
//             }else
//             totalPrize =  (figure?.figures?.second * 5000 ) / 3
//           }
//       break;
//     default:
//       break;
//    }

//     // calculation
//   }

//     // prizes (inam)
//     return res.send({results ,totalPrize})

//     const response = [];

//     for (const { figure, first, second } of figures) {
//       const figureLength = String(figure).length;

//       let multiplier;
//       if (figureLength === 1) {
//         multiplier = 7;
//       } else if (figureLength === 2) {
//         multiplier = 70;
//       } else if (figureLength === 3) {
//         multiplier = 700;
//       } else if (figureLength === 4) {
//         multiplier = 5000;
//       } else {
//         continue;
//       }

//       for (const user of users) {
//         const userFigures = Array.isArray(user.figures) ? user.figures : [user.figures];

//         const userFigure = userFigures.find(f => f.figure === figure);

//  const totalPurchases = userFigures.reduce((acc, fig) => {
//   return acc + (fig.first || 0) + (fig.second || 0);
// }, 0);

//         if (userFigure) {
//           const updatedValues = {
//             first: userFigure.first,
//             second: userFigure.second
//           };

//           if (first) {
//             updatedValues.first = userFigure.first * multiplier;
//           }
//           if (second) {
//             updatedValues.second = userFigure.second * multiplier;
//           }

//           // await Purchase.updateOne(
//           //   { userId: user.userId, "figures.figure": figure },
//           //   {
//           //     $set: {
//           //       "figures.$.first": updatedValues.first,
//           //       "figures.$.second": updatedValues.second
//           //     }
//           //   }
//           // );

//           response.push({
//             userId: user.userId,
//             bondType: bondType,
//             originalFigure: figure,
//             updatedFirst: first ? updatedValues.first : null,
//             updatedSecond: second ? updatedValues.second : null,
//             totalPurchases: totalPurchases,
//             multiplier: multiplier,
//           });
//         }
//       }
//     }

//     res.status(200).json({
//       isSuccess: true,
//       message: "Users found and figures processed successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("Error processing bond figures:", error);
//     res.status(500).json("Internal Server Error");
//   }
// };

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
