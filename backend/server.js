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

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');
const adminDir = path.join(rootDir, 'admin');

// Basic middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(rootDir))); // Serve all static files from root
app.use('/styles', express.static(path.join(rootDir, 'styles')));
app.use('/scripts', express.static(path.join(rootDir, 'scripts')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use('/components', express.static(path.join(rootDir, 'components')));
app.use('/book_images', express.static(path.join(rootDir, 'book_images')));

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

async function ensureBucketExists() {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase
            .storage
            .listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            return false;
        }

        // Check if book-images bucket exists
        const bucketExists = buckets.some(bucket => bucket.name === 'book-images');

        if (!bucketExists) {
            // Create the bucket if it doesn't exist
            const { data, error: createError } = await supabase
                .storage
                .createBucket('book-images', {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB in bytes
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
                });

            if (createError) {
                console.error('Error creating bucket:', createError);
                return false;
            }

            console.log('Created book-images bucket successfully');
        }

        return true;
    } catch (error) {
        console.error('Error in ensureBucketExists:', error);
        return false;
    }
}

async function ensureBookRequestsTable() {
    try {
        // Check if the table exists by attempting to select from it
        const { error: checkError } = await supabase
            .from('book_requests')
            .select('id')
            .limit(1);

        if (checkError && checkError.code === '42P01') {
            console.log('Book requests table does not exist, creating it...');
            
            // Create the table using SQL
            const { error: createError } = await supabase.rpc('create_book_requests_table', {});

            if (createError) {
                console.error('Error creating book_requests table:', createError);
                return false;
            }

            console.log('Created book_requests table successfully');
            return true;
        }

        return true;
    } catch (error) {
        console.error('Error in ensureBookRequestsTable:', error);
        return false;
    }
}

// Call both setup functions when server starts
Promise.all([ensureBucketExists(), ensureBookRequestsTable()])
    .then(([bucketSuccess, tableSuccess]) => {
        if (bucketSuccess && tableSuccess) {
            console.log('All storage and table checks completed successfully');
        } else {
            console.error('Failed to ensure all required resources exist');
        }
    });

// API Routes
// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json({ users });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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

// Get public approved books
app.get('/api/public/books', async (req, res) => {
    try {
        const query = supabase
            .from('books')
            .select(`
                *,
                users (
                    username,
                    email
                )
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        const { data: books, error } = await query;
        
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

// Get public book details by ID
app.get('/api/public/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching public book with ID:', id);
        
        const { data: book, error } = await supabase
            .from('books')
            .select(`
                *,
                users (
                    username,
                    email
                )
            `)
            .eq('id', id)
            .eq('status', 'approved')
            .single();

        if (error) {
            console.error('Error fetching book:', error);
            return res.status(500).json({ error: 'Failed to fetch book' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        console.log('Found book:', book);
        res.json({ book });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get book by ID
app.get('/api/books/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching book with ID:', id);
        
        const { data: book, error } = await supabase
            .from('books')
            .select(`
                *,
                users (
                    username,
                    email
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching book:', error);
            return res.status(500).json({ error: 'Failed to fetch book' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        console.log('Found book:', book);
        res.json({ book });

    } catch (error) {
        console.error('Server error:', error);
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

app.post('/api/admin/add-book', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        console.log('Admin add book request received');
        const { title, author, genre, summary } = req.body;
        const imageFile = req.file;

        console.log('Request data:', { title, author, genre, summary, imageFile });

        // Validate required fields
        if (!title || !author) {
            return res.status(400).json({ error: 'Title and author are required' });
        }

        // Upload image to Supabase Storage
        let imageUrl = null;
        if (imageFile) {
            try {
                console.log('Uploading image to Supabase Storage...');
                // Ensure bucket exists before uploading
                const bucketExists = await ensureBucketExists();
                if (!bucketExists) {
                    return res.status(500).json({ error: 'Storage system is not properly configured' });
                }

                const fileExt = path.extname(imageFile.originalname);
                const fileName = `book-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('book-images')
                    .upload(fileName, imageFile.buffer, {
                        contentType: imageFile.mimetype,
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
                console.log('Image URL generated:', imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        // Insert book into Supabase
        try {
            console.log('Inserting book into database...');
            const { data: book, error } = await supabase
                .from('books')
                .insert({
                    title,
                    author,
                    genre,
                    summary,
                    image_url: imageUrl,
                    status: 'pending',
                    user_id: req.user.id
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Book inserted successfully:', book);
            res.status(201).json({ message: 'Book added successfully', book });
        } catch (error) {
            console.error('Error inserting book:', error);
            res.status(500).json({ error: 'Failed to add book' });
        }
    } catch (error) {
        console.error('Server error:', error);
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

// Update book details (admin only)
app.patch('/api/books/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, genre, summary } = req.body;

        // Validate required fields
        if (!title || !author || !genre) {
            return res.status(400).json({ error: 'Title, author, and genre are required' });
        }

        const { data: updatedBook, error } = await supabase
            .from('books')
            .update({ 
                title,
                author,
                genre,
                summary
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating book:', error);
            return res.status(500).json({ error: 'Failed to update book' });
        }

        res.json({
            message: 'Book updated successfully',
            book: updatedBook
        });

    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create book request
app.post('/api/books/:id/request', authenticateToken, async (req, res) => {
    try {
        const { id: bookId } = req.params;
        const { address, contact_number } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!address || !contact_number) {
            return res.status(400).json({ error: 'Address and contact number are required' });
        }

        // Validate contact number format
        if (!/^\d{10}$/.test(contact_number)) {
            return res.status(400).json({ error: 'Contact number must be 10 digits' });
        }

        // Check if book exists and is approved
        const { data: book, error: bookError } = await supabase
            .from('books')
            .select('status')
            .eq('id', bookId)
            .single();

        if (bookError || !book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.status !== 'approved') {
            return res.status(400).json({ error: 'This book is not available for request' });
        }

        // Check if user has already requested this book
        const { data: existingRequest, error: requestError } = await supabase
            .from('book_requests')
            .select('id')
            .eq('book_id', bookId)
            .eq('user_id', userId)
            .eq('status', 'pending')
            .single();

        if (existingRequest) {
            return res.status(400).json({ error: 'You have already requested this book' });
        }

        // Create the request
        const { data: request, error: createError } = await supabase
            .from('book_requests')
            .insert([
                {
                    book_id: bookId,
                    user_id: userId,
                    address,
                    contact_number
                }
            ])
            .select()
            .single();

        if (createError) {
            console.error('Error creating request:', createError);
            return res.status(500).json({ error: 'Failed to create request' });
        }

        res.status(201).json({ request });

    } catch (error) {
        console.error('Request book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's book requests
app.get('/api/my-requests', authenticateToken, async (req, res) => {
    try {
        const { data: requests, error } = await supabase
            .from('book_requests')
            .select('book_id')
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get all book requests with details for admin
app.get('/api/admin/book-requests', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (adminError) {
            console.error('Error checking admin status:', adminError);
            return res.status(500).json({ error: 'Failed to verify admin status' });
        }

        if (!adminData || adminData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Fetch book requests with related data
        const { data: requests, error: requestsError } = await supabase
            .from('book_requests')
            .select(`
                *,
                books (
                    title,
                    author,
                    genre,
                    image_url
                ),
                users (
                    email,
                    fullname
                )
            `)
            .order('created_at', { ascending: false });

        if (requestsError) {
            console.error('Error fetching book requests:', requestsError);
            return res.status(500).json({ error: 'Failed to fetch book requests' });
        }

        // Ensure all required data is present and map the fullname to name for frontend consistency
        const validRequests = requests
            .filter(request => 
                request.books && 
                request.users && 
                request.books.title && 
                request.users.email
            )
            .map(request => ({
                ...request,
                users: {
                    ...request.users,
                    name: request.users.fullname // Map fullname to name for frontend
                }
            }));

        res.json({ requests: validRequests });
    } catch (error) {
        console.error('Error in book requests endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update book request status (admin only)
app.put('/api/admin/book-requests/:id/status', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (adminError || adminData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Update request status
        const { error } = await supabase
            .from('book_requests')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete book (admin only)
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (adminError || adminData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { id } = req.params;

        // First check if there are any pending requests for this book
        const { data: requests, error: requestError } = await supabase
            .from('book_requests')
            .select('id')
            .eq('book_id', id)
            .eq('status', 'pending');

        if (requestError) {
            console.error('Error checking book requests:', requestError);
            return res.status(500).json({ error: 'Failed to check book requests' });
        }

        if (requests && requests.length > 0) {
            return res.status(400).json({ error: 'Cannot delete book with pending requests' });
        }

        // Delete the book
        const { error: deleteError } = await supabase
            .from('books')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting book:', deleteError);
            return res.status(500).json({ error: 'Failed to delete book' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error in delete book endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Page routes
app.get('/', (req, res) => {
    res.sendFile(path.join(pagesDir, 'index.html'));
});

const pages = ['donate', 'about', 'books', 'contact', 'dashboard', 'login', 'signup'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(pagesDir, `${page}.html`));
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

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }     }
    }    );

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

