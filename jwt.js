const jwt=require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    //1st cheak request header has authorization or not
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ error: 'Token not found' });
    }

    // Extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unothorized' });
    }
    //else token is found
    try {
        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded token (user data) to the request object
        req.user = decoded; 
        // Pass to the next middleware
        next(); 
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};


//Function to generate jwt token
const generateToken=(userData)=>{
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:300000000});
}


//Export the jwtAuthMiddleware and generateToken function
module.exports={jwtAuthMiddleware,generateToken};