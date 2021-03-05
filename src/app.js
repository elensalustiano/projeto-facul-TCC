const app = require('express')()
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const cors = require('cors')

const swaggerDocument = yaml.load('swagger.yaml')
const router = require('./router')

const MAX_BODY_SIZE = '50mb'

app.use(bodyParser.json({ limit: MAX_BODY_SIZE }))
app.use(bodyParser.urlencoded({ limit: MAX_BODY_SIZE, extended: true }))

// CORS
app.use(cors())
app.options('*', cors())

// SWAGGER
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// ROUTES
app.use(router)

module.exports = app
