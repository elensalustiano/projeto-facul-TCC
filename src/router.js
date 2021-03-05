const app = require('express')()

const errorMiddleware = require('./middleware/error')
const authMiddleware = require('./middleware/auth')

const institution = require('./app/services/institution')
const applicant = require('./app/services/applicant')
const user = require('./app/services/user')
const category = require('./app/services/category')
const object = require('./app/services/object')
const coupon = require('./app/services/coupon')
const notification = require('./app/services/notification')

// common
app.post('/login', user.login)
app.post('/passwordRecovery', user.passwordRecovery)
app.patch('/changePassword', user.changePassword)

// applicant
app.post('/applicant', applicant.register)
app.patch('/applicant', authMiddleware, applicant.update)

// institution
app.post('/institution', institution.register)
app.get('/institution', institution.findAll)
app.patch('/institution', authMiddleware, institution.update)

// category
app.post('/category', authMiddleware, category.register)
app.patch('/category', authMiddleware, category.update)
app.delete('/category/:id', authMiddleware, category.deleteCategory)
app.get('/category', category.get)

// object
app.post('/object', authMiddleware, object.register)
app.patch('/object', authMiddleware, object.update)
app.get('/object', authMiddleware, object.getObject)
app.delete('/object/:id', authMiddleware, object.deleteObject)

app.post('/object/find', object.search)
app.patch('/object/find', authMiddleware, object.solicit)
app.patch('/object/devolve', authMiddleware, object.devolve)
app.patch('/object/cancel', authMiddleware, object.cancelSolicitation)

app.patch('/object/interested', authMiddleware, object.registerInterest)
app.get('/object/interested', authMiddleware, object.getObjectByInterested)
app.delete('/object/interested/:objectId', authMiddleware, object.deleteInterested)

// coupon
app.post('/coupon', coupon.register)
app.get('/coupon', coupon.get)

// notification
app.post('/notification', authMiddleware, notification.register)
app.get('/notification', authMiddleware, notification.get)
app.delete('/notification/:id', authMiddleware, notification.deleteNotification)

app.use(errorMiddleware)

module.exports = app
