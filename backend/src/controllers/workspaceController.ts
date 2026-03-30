import type { Request, Response } from 'express';
import Workspace from '../models/workspaceModel.js';

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const workspace = await Workspace.create({
      name,
      owner: (req as any).user._id,
      members: [{ user: (req as any).user._id, role: 'owner' }],
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyWorkspaces = async (req: Request, res: Response) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': (req as any).user._id,
    }).populate('owner', 'name email');

    const workspacesWithRoles = workspaces.map((ws) => {
      const membership = ws.members.find(
        (m) => m.user.toString() === (req as any).user._id.toString()
      );
      return {
        _id: ws._id,
        name: ws.name,
        userRole: membership?.role,
        subscription: ws.subscription,
      };
    });

    res.json(workspacesWithRoles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const { id } = req.params;

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    // Check if user is already a member
    const alreadyMember = workspace.members.some(m => m.user.toString() === (userToAdd._id as any).toString());
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({ user: userToAdd._id as any, role: role || 'member' });
    await workspace.save();

    res.json({ message: 'Member added successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real app, you'd also delete/archive documents, members, etc.
    await Document.deleteMany({ workspace: id });
    await Workspace.findByIdAndDelete(id);

    res.json({ message: 'Workspace and all associated documents deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import User from '../models/userModel.js';
import Document from '../models/documentModel.js';

