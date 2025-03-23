import jwtDecode from 'jwt-decode';

interface DecodedToken {
    exp: number;
    [key: string]: any;
}


export const validateJWT = (jwt: string): boolean => {
    try {
        const decoded: DecodedToken = jwtDecode(jwt);
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
