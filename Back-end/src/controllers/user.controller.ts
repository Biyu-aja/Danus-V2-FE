import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();

    res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
