const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.get('/hello', (req, res) => {
  res.json({ msg: 'Hello, world!' })
})

// Let JSON Server handle the default REST routes (/users, etc.)
server.use(router)

const PORT = 3000
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
})
