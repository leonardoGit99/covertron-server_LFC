import { TokenPayload } from "../models/token.model";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}