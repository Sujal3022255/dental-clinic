import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// Get all content
export const getAllContent = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query; // 'tip', 'blog', or 'document'

    const where = type ? { type: type as string } : {};

    const content = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get content by ID
export const getContentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new content (Admin only)
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, imageUrl, documentUrl, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const content = await prisma.content.create({
      data: {
        title,
        description: description || '',
        type,
        imageUrl,
        documentUrl,
        tags: tags || [],
        authorId: userId,
        published: true,
      },
    });

    res.status(201).json({
      message: 'Content created successfully',
      content,
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update content (Admin only)
export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, imageUrl, documentUrl, tags, published } = req.body;

    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        title: title || existingContent.title,
        description: description !== undefined ? description : existingContent.description,
        type: type || existingContent.type,
        imageUrl: imageUrl !== undefined ? imageUrl : existingContent.imageUrl,
        documentUrl: documentUrl !== undefined ? documentUrl : existingContent.documentUrl,
        tags: tags !== undefined ? tags : existingContent.tags,
        published: published !== undefined ? published : existingContent.published,
      },
    });

    res.json({
      message: 'Content updated successfully',
      content,
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete content (Admin only)
export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await prisma.content.delete({
      where: { id },
    });

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
