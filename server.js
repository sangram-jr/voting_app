const express=require('express')
const app=express();


//import db.js
const db=require('./db');



//define body parser
const bodyParser=require('body-parser')
app.use(bodyParser.json());  //req.body





//Import the router file
const userRoutes=require('./routes/userRoutes')
const candidateRoutes=require('./routes/candidateRoutes');

//Use the routers
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);




//define port
require('dotenv').config();
const PORT=process.env.PORT || 3000;



app.listen(PORT,()=>{
    console.log("listening on port 3000");
    
})