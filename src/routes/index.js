import express from 'express'
import bondPurchase from '../modules/admin/purchases/router.js'

import admin from '../modules/admin/router.js'

export default (app) => {
    const apiV1Router = express.Router()
    apiV1Router.use('/bond', bondPurchase)
    apiV1Router.use("/admin", admin);
// test
// 11 and 22 
    app.use('/api/v1', apiV1Router)
}
