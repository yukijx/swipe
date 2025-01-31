const express = require('express')
const app = express()

// parse json
app.use(express.json())

// store shit in mem
const users = [
  { id: 1, username: 'bill', password: '12' },
  { id: 2, username: 'bob',   password: 'my12' },
]
//testing
app.get('/login', (req, res) => {
    res.send('Hello from GET /login')
  })
  
// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)

  if (user) {
    return res.json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      token: 'fake-jwt-token-123'/// we can add jwt later
    })
  }
  return res.status(401).json({
    success: false,
    message: 'Invalid username or password'
  })
})
app.listen(3000, () => {
  console.log('Mock login server running on port 3000')
})
