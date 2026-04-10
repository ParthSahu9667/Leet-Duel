import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    setCookie(res, refreshToken);

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    setCookie(res, refreshToken);

    res.json({
      message: 'Logged in successfully',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'No Google token provided' });
      return;
    }

    // Since the frontend provides an opaque access_token (not an id_token JWT),
    // we fetch the user's verified profile directly from Google's UserInfo API
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!googleResponse.ok) {
      res.status(400).json({ message: 'Invalid Google access token' });
      return;
    }

    const payload = await googleResponse.json();
    
    if (!payload?.email) {
      res.status(400).json({ message: 'Invalid Google token payload' });
      return;
    }

    const { email, name, sub: googleId } = payload;
    
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      // Create new user without password
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId
      });
    } else if (!user.googleId) {
      // Link Google ID if user exists with this email but without Google ID
      user.googleId = googleId;
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    setCookie(res, refreshToken);

    res.json({
      message: 'Google login successful',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during Google auth', error: error.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.jwt;
    
    if (!refreshToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: any, decoded: any) => {
      if (err || user.id !== decoded.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
      res.json({ accessToken });
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during token refresh', error: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      res.sendStatus(204); // No content
      return;
    }

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during logout', error: error.message });
  }
};
