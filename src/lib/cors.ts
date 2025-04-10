import Cors from 'cors';
import initMiddleware from './init-middleware';

// Allow all CORS requests
const cors = initMiddleware(
  Cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

export default cors;
