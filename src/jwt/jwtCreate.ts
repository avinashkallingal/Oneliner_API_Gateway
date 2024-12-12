import jwt from 'jsonwebtoken';
import config from '../config/config';

interface userPayload {
    id: string,
    email: string,
    role:string|null,
}

export const generateToken = (user: userPayload) => {

    const payload = {
        id: user.id,
        email: user.email,
        role:user.role,
    }

    const options = {
        expiresIn: '15m'
    }
    // 1s

    const accessToken = jwt.sign(payload, config.jwt_key as string, options);
    const refreshToken = jwt.sign(payload, config.jwt_key as string, { expiresIn: '7d' });
    return { accessToken, refreshToken }

    // return jwt.sign(payload, config.jwt_key as string, options);

}