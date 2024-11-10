import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema({
    userId:{type:String}, 
    date:{type:String},
    figures: {
        figure: { type: Number},
        first: { type: Number},
        second: { type: Number },
    },
    bondType:{type:String},
    createdAt: { 
        type: Date, 
        default: Date.now
      },
    isNormal: { type: Boolean, default: true }, 
});
export const Purchase = mongoose.model('Purchase', purchaseSchema);

