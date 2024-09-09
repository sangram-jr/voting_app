const express=require('express');
const router=express.Router();

//import the user model
const User=require('./../models/user');

//import jwtAuthMiddleware and generateToken function 
const {jwtAuthMiddleware,generateToken}=require('./../jwt');





//post method for user sign up
router.post('/signup',async(req,res)=>{
    try{

        const data=req.body; //assuming that all user data are included in req.body

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }


        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }


        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }


        //create a new user document using the mongoose model
        const newUser=new User(data);
        //save the newperson to the database
        const response=await newUser.save();
        console.log('data saved');

        const payload={
            id:response.id
            //username:response.username
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload);
        console.log("Token is:",token);
        
        res.status(200).json({response:response,token:token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }   
})




//Login route
router.post('/login',async(req,res)=>{
    try {
        //extract aadharCardNumber and password from req body
        const {addharCardNumber,password}=req.body;
        //cheak in database addharCardNumber is present or not
        //find user by addharCardNumber
        const user=await User.findOne({addharCardNumber:addharCardNumber});
        //if the user does not exist or password does not match, return error
        if(!user || (await user.comparePassword(password))){
            return res.status(401).json({error:'Invalid username or password'});
        }
        //else generate token
        //for generate token we need payload
        const payload={
            id:user.id
            //username:user.username
        }
        const token=generateToken(payload);
        //return token as responce
        res.json({token});
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})





//profile route (where user can cheak his profile)
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  // Access the user ID from the decoded token
        const user = await User.findById(userId);  // Query the database
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});






//put method for update password
router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        //Extract id from token
        const userId=req.user.id;
        //Extract current and new password from request body
        const {currentPassword,newPassword}=req.body;
        //find the user by userId
        const user=await User.findById(userId);

        //if password does not match , return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid password'});
        }
        
        //update the password
        user.password=newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message:'Password Updated'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Invalid server Error'});
        
    }
})



//export the router
module.exports=router;