import Joi from 'joi'
import { MESSEGES } from '../../constants/index.js'
export const validateSignUpInputs = (data) => {
  const Schema = Joi.object({

    username: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
    confirmPassword: Joi.string().min(8).max(30).required()
      .valid(Joi.ref('password'))
      .messages({ 'any.only': MESSEGES.PASSWORD_MISMATCH })
    ,
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
