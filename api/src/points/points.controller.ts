import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';

// Create an item
export const getGltf = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const fileName = req.query['file'];

  if (!fileName) {
    res.status(400).json('invalid file query');
  }

  try {
    const file = readFileSync(`../assets/${fileName}`);

    res.status(200).send(file);
  } catch (error) {
    next(error);
  }
};
