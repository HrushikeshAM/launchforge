import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, authenticate } from '../middlewares/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key_launchforge';

// Register
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ email, passwordHash, firstName, lastName });
    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: user.id, email, firstName, lastName } });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
