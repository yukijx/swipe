import express, { Request, Response } from 'express'

const app = express()

app.use(express.json())

const users = [
  { id: 1, username: 'bill', password: '12' },
  { id: 2, username: 'bob',  password: 'my12' },
]

app.get('/login', (req: Request, res: Response) => {
  res.send('Hello from GET /login')
})

// POST /login
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body

  const user = users.find(u => u.username === username && u.password === password)

  if (user) {
    return res.json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      token: 'fake-jwt-token-123'
    })
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password'
  })
})

app.listen(3000, () => {
  console.log('Mock TypeScript server running on port 3000')
})
