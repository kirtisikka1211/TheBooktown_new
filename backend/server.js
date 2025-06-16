import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define root directory path - going up one level from backend
const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');
const adminDir = path.join(rootDir, 'admin');

// Serve static files from various directories
app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use('/components', express.static(path.join(rootDir, 'components')));

// Define routes for pages
const pages = ['donate', 'about', 'books', 'contact', 'dashboard', 'login', 'signup'];

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(pagesDir, 'index.html'));
});

// Routes for other pages
pages.forEach(page => {
    app.get(`/pages/${page}`, (req, res) => {
        res.sendFile(path.join(pagesDir, `${page}.html`));
    });
});

// Handle direct access to HTML files
pages.forEach(page => {
    app.get(`/${page}.html`, (req, res) => {
        res.redirect(`/pages/${page}`);
    });
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(adminDir, 'pages', 'index.html'));
});

app.get('/admin/:page', (req, res) => {
    const adminPage = req.params.page;
    res.sendFile(path.join(adminDir, 'pages', `${adminPage}.html`));
});

// Catch-all route for 404
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.status(404).sendFile(path.join(pagesDir, '404.html'));
    } else {
        next();
    }
});

// Routes

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, fullname, email, password, role = 'user' } = req.body;

        if (!username || !fullname || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`);

        if (checkError) {
            console.error('Error checking existing users:', checkError);
            return res.status(500).json({ error: 'Error checking existing users' });
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    username,
                    fullname,
                    email,
                    password: hashedPassword,
                    role
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating user:', insertError);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser.id, 
                username: newUser.username, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email or username
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${email}`)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Book donation with OCR
app.post('/api/donate-book', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, author, genre, summary } = req.body;
        let imageUrl = null;

        if (!title || !author) {
            return res.status(400).json({ error: 'Title and author are required' });
        }

        // Upload image to Supabase Storage if present
        if (req.file) {
            try {
                // Ensure bucket exists before uploading
                const bucketExists = await ensureBucketExists();
                if (!bucketExists) {
                    return res.status(500).json({ error: 'Storage system is not properly configured' });
                }

                const fileExt = path.extname(req.file.originalname);
                const fileName = `book-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('book-images')
                    .upload(fileName, req.file.buffer, {
                        contentType: req.file.mimetype,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    return res.status(500).json({ 
                        error: 'Failed to upload image',
                        details: uploadError.message 
                    });
                }

                // Get public URL for the uploaded image
                const { data } = supabase
                    .storage
                    .from('book-images')
                    .getPublicUrl(fileName);

                imageUrl = data.publicUrl;
            } catch (uploadError) {
                console.error('Error in image upload process:', uploadError);
                return res.status(500).json({ 
                    error: 'Failed to process image upload',
                    details: uploadError.message 
                });
            }
        }

        // Insert book into Supabase
        const { data: newBook, error } = await supabase
            .from('books')
            .insert([
                {
                    title,
                    author,
                    genre,
                    summary,
                    image_url: imageUrl,
                    user_id: req.user.id,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating book:', error);
            return res.status(500).json({ 
                error: 'Failed to create book',
                details: error.message 
            });
        }

        res.status(201).json({
            message: 'Book submitted successfully',
            book: newBook
        });

    } catch (error) {
        console.error('Error in book donation:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Get all books (admin only)
app.get('/api/books', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        console.log('Fetching books with status:', status);
        
        const query = supabase
            .from('books')
            .select(`
                *,
                users (
                    username,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (status) {
            console.log('Filtering by status:', status);
            query.eq('status', status);
        }

        const { data: books, error } = await query;
        
        console.log('Query result:', { books, error });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch books' });
        }

        res.json({ books });

    } catch (error) {
        console.error('Fetch books error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's books
app.get('/api/my-books', authenticateToken, async (req, res) => {
    try {
        const { data: books, error } = await supabase
            .from('books')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch books' });
        }

        res.json({ books });

    } catch (error) {
        console.error('Fetch user books error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update book status (admin only)
app.patch('/api/books/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data: updatedBook, error } = await supabase
            .from('books')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update book status' });
        }

        res.json({
            message: 'Book status updated successfully',
            book: updatedBook
        });

    } catch (error) {
        console.error('Update book status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json({ users });

    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

