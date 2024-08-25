import mongoose from 'mongoose'


import { apiError, verifyJwtToken } from '../utils/index.js'
import { MESSEGES } from '../constants/index.js'
import { getUserByConditions } from '../modules/admin/services.js';


const isAuthorized = async (req, res, next) => {
    try {
        const bearer = req?.headers?.authorization;
        if (!bearer) {
            res.status(404);
            return next(apiError.badRequest(MESSEGES.AUTHORIZATION_INVALID, 'isAuthorized'))
        }

        const token = bearer.split(' ')[1] || ''

        if (!token) {
            return next(apiError.badRequest(MESSEGES.AUTHORIZATION_TOKEN_NOT_FOUND, 'isAuthorized'))
        }

        const decodeUser = await verifyJwtToken(token)

        
        
        if (!decodeUser) return next(apiError.badRequest(MESSEGES.TOKEN_NOT_VERIFIED, 'isAuthorized'))

        const username = decodeUser?.username;

        const user = await getUserByConditions  ({ username })


        if (!user) {
            return next(apiError.badRequest(MESSEGES.USERNAME_NOT_FOUND, 'isAuthorized'))
        }

        req.userId = new mongoose.Types.ObjectId(user?._id)
       
        req.user = user

        next()
    } catch (error) {
        console.log(error, 'errror')
        return next(apiError.badRequest(error?.message === 'jwt expired' ? MESSEGES.TOKEN_EXPIRED : MESSEGES.TOKEN_INVALID, 'verifyRefreshToken'))
    }
};

export default isAuthorized;
