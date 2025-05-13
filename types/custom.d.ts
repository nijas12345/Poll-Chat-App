import 'express';

declare module 'express' {
   interface Request {
      email?: string;
      admin_id?:string
   }
}