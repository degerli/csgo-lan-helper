import { Server } from '../models'

export default function (app) {
  app.get('/', function(req, res) {
    res.status(200).send('Welcome to our restful API')
    Server.findAll().then(servers => {
      console.log(servers)
    })
  })
}