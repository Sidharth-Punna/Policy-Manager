const jwt = require('jsonwebtoken'); // Make sure you have jwt installed
require('dotenv').config({ path: './conifg/.env' });


exports.verifyToken = (req, res, next)=> {
    const token = req.cookies.token;
    if (!token){
        return res.status(403).json({ success: false, message: 'Token is required' });
    } 

    // Split the token from the 'Bearer' keyword if it's provided like 'Bearer <token>'

    // Replace 'your_secret_key' with your actual secret key from .env or directly in code
    jwt.verify(token, process.env.JWT_SECRET , (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        };
        
        // Attach the decoded user information to the request object
        req.user = decoded;
        if(req.user.role!=='user')
        {
            return res.status(401).json({ success: false, message: 'Access Denied' });
        }
        next();
    });
}
