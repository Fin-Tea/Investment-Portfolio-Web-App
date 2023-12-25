import { authenticateToken } from './services/account';

export default function authenticateTokenMiddleware(req, res, next) {
  let token = req.cookies && req.cookies.jwt;

  // try to see if token is present on auth header
  if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
  }

  if (token == null) {
       return res.sendStatus(401);
  }

  try {
    const account = authenticateToken(token); 

    req.account = account; // not necessary since accountId is a route param

    next();

  } catch (e) {
    res.clearCookie('jwt');
    return res.sendStatus(403);
  }
}