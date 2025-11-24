require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// MongoDB Setup
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dwmxail.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const db = client.db("gadgetverse_db");
        const productsCollection = db.collection("products");
        const usersCollection = db.collection("users");
        const accountsCollection = db.collection("accounts");

        // ========== NEXT-AUTH ROUTES ==========

        // CREDENTIALS LOGIN (for Login)
        app.post('/api/auth/login', async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

                // Find user
                const user = await usersCollection.findOne({ email });
                if (!user) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Check password
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Return user data in NextAuth.js format
                const userResponse = {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    image: user.image
                };

                res.status(200).json(userResponse);

            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Login failed' });
            }
        });

        // CREATE USER (for registration)
        app.post('/api/auth/register', async (req, res) => {
            try {
                const { name, email, password } = req.body;

                if (!name || !email || !password) {
                    return res.status(400).json({ error: 'All fields are required' });
                }

                if (password.length < 6) {
                    return res.status(400).json({ error: 'Password must be at least 6 characters' });
                }

                // Checking if user already exists
                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ error: 'User already exists with this email' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 12);

                // Creating user
                const newUser = {
                    name,
                    email,
                    password: hashedPassword,
                    emailVerified: null,
                    image: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await usersCollection.insertOne(newUser);

                // Return user data without password
                const userResponse = {
                    id: result.insertedId.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    emailVerified: newUser.emailVerified,
                    image: newUser.image
                };

                res.status(201).json(userResponse);

            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ error: 'Registration failed' });
            }
        });

        // GET USER BY EMAIL (for NextAuth.js)
        app.get('/api/auth/user', async (req, res) => {
            try {
                const { email } = req.query;
                if (!email) {
                    return res.status(400).json({ error: 'Email is required' });
                }

                const user = await usersCollection.findOne({ email });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const { password: _, ...userWithoutPassword } = user;
                res.status(200).json(userWithoutPassword);

            } catch (error) {
                console.error('Get user error:', error);
                res.status(500).json({ error: 'Failed to get user' });
            }
        });

        // ========== PRODUCT ROUTES ==========

        // GET ALL PRODUCTS (with filter/search)
        app.get('/api/products', async (req, res) => {
            try {
                const { category, search } = req.query;
                let query = {};

                if (category && category !== 'all') query.category = category;

                if (search) {
                    query.$or = [
                        { title: { $regex: search, $options: 'i' } },
                        { category: { $regex: search, $options: 'i' } }
                    ];
                }

                const products = await productsCollection.find(query).toArray();
                res.status(200).json(products);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ error: 'Failed to fetch products' });
            }
        });

        // GET RECENT PRODUCTS
        app.get('/api/products/recent', async (req, res) => {
            try {
                const products = await productsCollection.find()
                    .sort({ createdAt: -1 })
                    .limit(6)
                    .toArray();
                res.status(200).json(products);
            } catch (error) {
                console.error('Error fetching recent products:', error);
                res.status(500).json({ error: 'Failed to fetch recent products' });
            }
        });

        // GET SINGLE PRODUCT
        app.get('/api/products/:id', async (req, res) => {
            try {
                const product = await productsCollection.findOne({
                    _id: new ObjectId(req.params.id)
                });
                if (!product) return res.status(404).json({ error: 'Product not found' });
                res.status(200).json(product);
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).json({ error: 'Failed to fetch product' });
            }
        });

        // ADD PRODUCT
        app.post('/api/products', async (req, res) => {
            try {
                const newProduct = {
                    ...req.body,
                    createdAt: new Date(),
                };
                const result = await productsCollection.insertOne(newProduct);
                res.status(201).json(result);
            } catch (error) {
                console.error('Error adding product:', error);
                res.status(500).json({ error: 'Failed to add product' });
            }
        });

        // DELETE PRODUCT
        app.delete('/api/products/:id', async (req, res) => {
            try {
                const result = await productsCollection.deleteOne({
                    _id: new ObjectId(req.params.id)
                });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.status(200).json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error deleting product:', error);
                res.status(500).json({ error: 'Failed to delete product' });
            }
        });

        console.log("✅ GadgetVerse DB Connected - NextAuth.js Ready");
    } finally {
        // await client.close();
    }
}
run().catch(console.error);

// Root route
app.get('/', (req, res) => {
    res.send("🚀 GadgetVerse Server Running");
});

app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
});