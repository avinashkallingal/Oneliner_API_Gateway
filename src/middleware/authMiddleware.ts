// import { NextFunction, Request, Response } from "express";
// import jwt from 'jsonwebtoken';
// import config from "../config/config";
// import { HttpStatus } from "../enum/StatusCode";

// const authencticateToken = (req: Request, res: Response, next: NextFunction,role:string) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//   //  const cookieToken = req.cookies.token;

//     if (!token) {
//         return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Access denied, Token not found' });
//     }

//     // if (token !== cookieToken) {
//     //     return res.status(401).json({ error: 'Token mismatch' });
//     // }

//     jwt.verify(token, config.jwt_key as string, (err, decode:any) => {
//         if (err) {
//             return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Invalid Token' });
//         }
//         if(decode){
          
//             console.log('Token verified, user ID attached:', req.body.userId);
//             console.log(decode.role)
//             if (options.role === decode.role) {
//                 next();
//             } else {
//                 next();
//             }
//         }
   
//     })
// }

// export default authencticateToken

import { NextFunction, Request, Response } from "express";
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from "../config/config";
import { HttpStatus } from "../enum/StatusCode";

interface AuthMiddlewareOptions {
    role: string;
}



const authenticateToken = (options: AuthMiddlewareOptions): RequestHandler => {
    // console.log("hiii  i am auth middleware^^^^^^^^^^^^^^^^^^^^^")
    return (req: Request, res: Response, next: NextFunction) => {
        console.log('Function is triggered for authentication validation');

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('Token not found');
            return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Access denied, token not found' });
        }

        console.log('Token found, verifying...');
        jwt.verify(token, config.jwt_key as string, (err, decoded:any) => {
            if (err) {
                console.log('Invalid token');
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Invalid token' });
            }
            console.log('Decoded token:', decoded);
            console.log('Decoded role:', decoded?.role);

            console.log('Additional value:', options.role);

            if (decoded) {
                console.log('Token verified, user ID attached:', req.body.userId);
                console.log(decoded.role," decoded role]]]]]]]]]]")
                console.log(options.role," options role&&&&&&&&&&&&&]")
                if (options.role === decoded.role) {
                    next();
                } else {
                    // next();
                    console.log("role authorization issue")
                    return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'role authorization error' });
                }
            } else {
                console.log('else in decode value')
            }


        });
    };
};

export default authenticateToken;
