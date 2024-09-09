const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

//define the user schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String
    },
    mobail:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    addharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
})



//hash password concept using bcrypt
userSchema.pre('save',async function (next) {
    const user=this;
    //old password , so dont need to hash
    if(!user.isModified('password'))
        return next();
    //Hash the password  only if it has been new or modified
    try{
        //generate the salt
        const salt=await bcrypt.genSalt(10);
        //hash password
        const hashPassword=await bcrypt.hash(user.password,salt);
        // Now replace the password into hashPassword
        user.password=hashPassword;
        //next callback function call
        next();
    }catch(err){
        return next(err);
    }
})

//compare password
userSchema.methods.comparePassword=async function (candidatePassword) {
    try{
        //use bcrypt to compare provided password with hashed password
        const isMatch=await bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    }catch(err){
        throw(err);
    }
}



//create person model
const User=mongoose.model('User',userSchema);
//export the person model
module.exports=User;