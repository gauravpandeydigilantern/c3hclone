import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends NextApiRequest {
  user?: any; // Replace 'any' with the actual type of the decoded token if you have one
}

export const authenticate = (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    (req as AuthenticatedRequest).user = decoded; 

    return handler(req, res);
  } catch (error) {
    console.log(error, "logout error");
    return res.status(401).json({ message: "Invalid token" });
  }
};
