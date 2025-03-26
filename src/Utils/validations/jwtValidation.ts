import { Buffer } from 'buffer';


export const validateJWT = (jwt: string): boolean => {
    try {
        const decoded = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString())
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return false;
        }
        return true;
    } catch (err) {
        console.error('JWT Decode Error:', err);
        return false;
    }
};
