import type { Request, Response } from 'express';
import Document from '../models/documentModel.js';
import Workspace from '../models/workspaceModel.js';
import { logActivity } from './activityController.js';

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, workspaceId } = req.body;
    const document = await Document.create({
      title,
      workspace: workspaceId,
      createdBy: (req as any).user._id,
    });

    await logActivity(
      workspaceId,
      (req as any).user._id,
      'DOCUMENT_CREATED',
      (document._id as any).toString(),
      'Document',
      `Created document: ${title}`
    );

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaceDocuments = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { search } = req.query;

    let query: any = { workspace: workspaceId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const documents = await Document.find(query).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Find user's role in the workspace this document belongs to
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': (req as any).user._id
    });
    
    const membership = workspace?.members.find(m => m.user.toString() === (req as any).user._id.toString());

    res.json({
      ...document.toObject(),
      userRole: membership?.role
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!document) return res.status(404).json({ message: 'Document not found' });

    await logActivity(
      (document.workspace as any).toString(),
      (req as any).user._id,
      'DOCUMENT_UPDATED',
      (document._id as any).toString(),
      'Document',
      `Updated document: ${title || document.title}`
    );

    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    await logActivity(
      (document.workspace as any).toString(),
      (req as any).user._id,
      'DOCUMENT_DELETED',
      (document._id as any).toString(),
      'Document',
      `Deleted document: ${document.title}`
    );

    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportDocument = async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const content = `# ${document.title}\n\n${document.content || ''}`;
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${document.title.replace(/\s+/g, '_')}.md"`);
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
