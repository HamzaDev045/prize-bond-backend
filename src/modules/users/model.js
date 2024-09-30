// export const userSchema = mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 2,
//       maxlength: 50,
//     },
//     username: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 8
//     },
//     companyId: {
//       type: mongoose.Types.ObjectId,
//       ref: 'Company',
//       default: null
//     },
//     roleId:
//     {
//       type: mongoose.Types.ObjectId,
//       ref: 'Roles',
//       default: null
//     }
//     ,
//     accountVerificationMethods: {
//       isEmailVerified: {
//         type: Boolean,
//         default: false
//       },
//       isPhoneVerified: {
//         type: Boolean,
//         default: false
//       }
//     },
//     accountType: {
//       type: String,
//       enum: ["user", "owner"],
//       default: "owner",
//       lowercase: true
//     },
//     isAccountEnable: {
//       type: Boolean,
//       default: true
//     },
//     resetToken: { type: String, default: "" },
//     resetTokenExpiry: { type: Date, default: null },
//     accessSharedBy: {
//       type: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//       }],
//       default: []
//     }
//   },
//   { timestamps: true },
// )