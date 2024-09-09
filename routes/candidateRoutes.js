const express=require('express');
const router=express.Router();

//import the user model
const User=require('./../models/user');

//import the candidate model
const Candidate=require('./../models/candidate');

//import jwtAuthMiddleware and generateToken function 
const {jwtAuthMiddleware,generateToken}=require('./../jwt');


//cheak user is admin or not by their user  id
const cheakAdminRole=async(userId)=>{
    try {
        const user=await User.findById(userId);
        return user.role=='admin';
    } catch (err) {
        return false;
    }
}



//post route to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    try{
        //if user is not addmin , then not add candidate
        if(! await cheakAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not have admin role'});
        }
        const data=req.body; //assuming that all candidate data are included in req.body
        //create a new candidate document using the mongoose model
        const newCandidate=new Candidate(data);
        //save the newcandidate to the database
        const response=await newCandidate.save();
        console.log('data saved');
        
        res.status(200).json({response:response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }   
})








//put method for update candidate
router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        //if user is not addmin , then not update candidate
        if(!await cheakAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not have admin role'});
        }
        //Extract id from the URL parameter
        const candidateId=req.params.candidateID;
        //updated data for the candidate
        const updatedCandidateData=req.body;

        const responce=await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new: true,  //retrun the new updated document
            runValidators: true,   //Runs mongoose validator
        })

        if(!responce){
            return res.status(404).json({error:'candidate not found'});
        }
        console.log('candidate data updated');
        res.status(200).json(responce);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server Error'});
        
    }
})



//Delete route for delete candidate
router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        //if user is not addmin , then not update candidate
        if(! await cheakAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not have admin role'});
        }
        //Extract id from the URL parameter
        const candidateId=req.params.candidateID;

        const responce=await Candidate.findByIdAndDelete(candidateId);

        if(!responce){
            return res.status(404).json({error:'candidate not found'});
        }
        console.log('candidate data deleted');
        res.status(200).json(responce);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server Error'});
        
    }
})




//let's start voting
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote once

    candidateID=req.params.candidateID;
    userId=req.user.id;

    try {
        //Find the candidate document with the specified candidateID
        const candidate=await Candidate.findById(candidateID);
        if(!candidate){
            res.status(404).json({message:'candidate not found'});
        }
        //Find the user document with the specified userId
        const user=await User.findById(userId);
        if(!user){
            res.status(404).json({message:'user not found'});
        }


        //user can only vote once
        if(user.isVoted){
            res.status(400).json({message:'You have already voted'});
        }
        //no admin cat vote
        if(user.role=='admin'){
            res.status(403).json({message:'admin is not allow'});
        }


        //update the Candidate document to record the vote
        //in candidate model, there is votes array where userId of user is saved and voteCount++
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        //in user model ,there is isVoted property,when vote is complete,isVoted is true
        user.isVoted=true;
        await user.save();

        res.status(200).json({message:'Vote recorded successfully'});

    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal server Error'});
    }
})




//vote count
router.get('/vote/count', async(req,res)=>{
    try {
        //Find all candidate and sort them by voteCount in decending order
        const candidate=await Candidate.find().sort({voteCount:'desc'})

        //Map the candidate to only return their name and voteCount
        const voteRecord=candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal server Error'});
    }
})





// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




//export the router
module.exports=router;