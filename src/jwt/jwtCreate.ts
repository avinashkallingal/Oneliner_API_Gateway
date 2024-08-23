import jwt from 'jsonwebtoken';
import config from '../config/config';

interface userPayload {
    id: string,
    email: string
}

export const generateToken = (user: userPayload) => {

    const payload = {
        id: user.id,
        email: user.email
    }

    const options = {
        expiresIn: '1h'
    }

    return jwt.sign(payload, config.jwt_key as string, options);

}