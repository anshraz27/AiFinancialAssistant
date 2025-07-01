const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req,resizeBy,next) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token)return res.status(401).json({message: 'Authorization Failed'});
    

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if(!user){
        return res.status(401).json({message: 'Token Not Valid'});
    }

    req.user = user;
    next();
    }
    catch(error){
        res.status(401).json({message: 'Invaliid Token'});
    }

};
module.exports = auth;