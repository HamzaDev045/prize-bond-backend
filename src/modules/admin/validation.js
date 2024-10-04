import Joi from 'joi'
import { MESSEGES } from '../../constants/index.js'
export const validateSignUpInputs = (data) => {
  const Schema = Joi.object({

    username: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
   
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}


export const validateSignInInputs = (data) => {
  const Schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
  });


  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }

}

export const schema = Joi.object({
    bondType: Joi.string().required(),
    figures: Joi.object({
        figure: Joi.number().required(),
        first: Joi.number().required(),
        second: Joi.number().required()
    }).required()
})
export const purchaseSchema = Joi.object({
    figure: Joi.number().required(),
    firstAmount: Joi.number().min(0).required(),
    secondAmount: Joi.number().min(0).required()
});
