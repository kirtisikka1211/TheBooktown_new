import express from 'express'
import { reviewsApi } from './api/reviews.js'
import { authApi } from './api/auth.js'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = process.env.PORT || 3000

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')
const publicDir = path.join(projectRoot, 'public')

// Serve static files from public directory
app.use(express.static(publicDir))
// Serve all HTML pages from the pages directory
const pages = ['about', 'books', 'contact', 'dashboard', 'donate', 'login', 'ocr', 'signup']

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'pages', '/index.html'))
})

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(publicDir, 'pages', `${page}.html`))
    })
})
// ?
// Serve admin pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicDir, 'admin/pages', 'index.html'))
})

app.get('/admin/:page', (req, res) => {
    const adminPage = req.params.page
    res.sendFile(path.join(publicDir, 'admin/pages', `${adminPage}.html`))
})

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, username, role } = req.body
    const metadata = { fullName, username, role }
    const data = await authApi.signUp(email, password, metadata)
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    const data = await authApi.signIn(email, password)
    const user = await authApi.getUser()
    const role = user?.user_metadata?.role || 'user'
    res.json({
      ...data,
      user: {
        ...data.user,
        role: role,
        redirectTo: role === 'admin' ? '/admin/dashboard' : '/dashboard'
      }
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/auth/signout', async (req, res) => {
  try {
    const data = await authApi.signOut()
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/auth/session', async (req, res) => {
  try {
    const session = await authApi.getSession()
    res.json(session)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/auth/user', async (req, res) => {
  try {
    const user = await authApi.getUser()
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Test endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    const result = await reviewsApi.testConnection()
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})