import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema({
    userId:{type:String},       
    figures: {
        figure: { type: Number},
        first: { type: Number},
        second: { type: Number },
    },
    bondType:{type:String},
    isNormal: { type: Boolean, default: true }, 
});
export const Purchase = mongoose.model('Purchase', purchaseSchema);

