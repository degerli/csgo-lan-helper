import express from 'express'
import bodyParser from 'body-parser'
import routes from './routes'

export default function () {
  var app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  routes(app)

  var server = app.listen(5005, function () {
    console.log('Backend server running on port.', server.address().port)
  })
  return server
}