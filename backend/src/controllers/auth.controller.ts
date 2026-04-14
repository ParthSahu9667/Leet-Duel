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

    let user = await User.findOne({ email });
    if (user) {
      // If user exists and ALREADY has a password, reject.
      if (user.password) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      
      // If user exists but has NO password (created via Google OAuth), 
      // allow them to set a password now, effectively linking the accounts.
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      // We can also update the name if they provided a new one, though optional.
      if (name) user.name = name;
    } else {
      // Normal signup for a new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email,
        password: hashedPassword
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    setCookie(res, refreshToken);

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, leetcodeUsername: user.leetcodeUsername || null }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // User exists but has no password (signed up via Google only)
    if (!user.password) {
      res.status(401).json({ message: 'This account was created using Google. Please sign in with Google or sign up with a password to link accounts.' });
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
      user: { id: user.id, name: user.name, email: user.email, leetcodeUsername: user.leetcodeUsername || null }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;
    if (!code || !codeVerifier || !redirectUri) {
      res.status(400).json({ message: 'Missing required Google OAuth parameters' });
      return;
    }

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oAuth2Client.getToken({
      code,
      codeVerifier,
    });

    if (!tokens.id_token) {
      res.status(400).json({ message: 'Failed to retrieve Google ID token' });
      return;
    }

    // Verify the ID Token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
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
      user: { id: user.id, name: user.name, email: user.email, leetcodeUsername: user.leetcodeUsername || null }
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
      res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, leetcodeUsername: user.leetcodeUsername || null } });
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
