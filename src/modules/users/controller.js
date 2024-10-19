import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      'your_jwt_secret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};



// export const updateSinglePurchase = async (req, res) => {
//   try {
//     const { purchaseId } = req.params;

//     const { figure, firstAmount, secondAmount } = req.body;

//     if (!purchaseId) {
//       return res.status(400).json({
//         isSuccess: false,
//         message: "Missing purchaseId parameter.",
//       });
//     }

//     if (!figure && !firstAmount && !secondAmount) {
//       return res.status(400).json({
//         isSuccess: false,
//         message: "At least one field (figure, firstAmount, secondAmount) must be provided for update.",
//       });
//     }

//   const purchase = await Purchase.findById(purchaseId);

//   if (!purchase) {
//     return res.status(404).json({
//       isSuccess: false,
//       message: "No purchase found with the given ID.",
//     });
//   }

//     const user = await UserModel.findById(purchase.userId); 
//     if (!user) {
//       return res.status(404).json({
//         isSuccess: false,
//         message: "User not found for this purchase.",
//       });
//     }

//     const firstDifference = firstAmount !== undefined ? firstAmount - purchase.figures.first : 0;
//     const secondDifference = secondAmount !== undefined ? secondAmount - purchase.figures.second : 0;
    
//     const totalDifference = firstDifference + secondDifference;


//     if (totalDifference > 0) {
//       if (totalDifference > user.balance) {
//         return res.status(400).json({
//           isSuccess: false,
//           message: "User does not have enough balance to cover the additional cost.",
//         });
//       }
//       user.balance -= totalDifference;
//     } else if (totalDifference < 0) {
//       user.balance += Math.abs(totalDifference);
//     }

//     await user.save();

//     const updateData = {
//       ...(figure !== undefined && { 'figures.figure': figure }),
//       ...(firstAmount !== undefined && { 'figures.first': firstAmount }),
//       ...(secondAmount !== undefined && { 'figures.second': secondAmount }),
//     };

//     const updatedPurchase = await Purchase.findByIdAndUpdate(
//       purchaseId,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedPurchase) {
//       return res.status(404).json({
//         isSuccess: false,
//         message: "No purchase found with the given ID.",
//       });
//     }

//     res.status(200).json({
//       isSuccess: true,
//       message: "Purchase updated successfully",
//       data: updatedPurchase,
//     });
//   } catch (err) {
//     console.error("Error updating purchase:", err);
//     res.status(500).json({
//       isSuccess: false,
//       message: "Internal Server Error",
//     });
//   }
// };