import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Workspace from '../models/workspaceModel.js';
import mongoose from 'mongoose';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, workspaceName } = req.body;

    if (password && password.length > 16) {
      return res.status(400).json({ message: 'Password must be at most 16 characters long' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    // Create default workspace for the user
    const workspace = await Workspace.create({
      name: workspaceName || `${name}'s Workspace`,
      owner: user._id,
      members: [{ user: user._id, role: 'owner' }],
    });

    user.currentWorkspace = workspace._id as any;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken((user._id as any).toString()),
      workspaceId: workspace._id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('currentWorkspace');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken((user._id as any).toString()),
        currentWorkspace: user.currentWorkspace,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

