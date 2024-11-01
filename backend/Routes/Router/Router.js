const express = require('express');
const router= express.Router();
const User = require('../../models/user.model');
const Note = require('../../models/note.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {authenticateToken} = require('../../utilities')


router.post('/create-account', async (req, res) => {

    const {fullName, email, password  } = req.body;

    if(!fullName) {
        return res.status(400).json({error: true, message:"Full Name is require!"})
    } if(!email) {
        return res.status(400).json({error: true, message:"Email is require!"})
    } if(!password){
        return res.status(400).json({error: true, message:"Password is require!"})
    }

    try {

        const isUser = await User.findOne({email:email});

        if(isUser){
            return res.status(400).json({error: true, message:"User already exist!"})
        }

        const hashedPassword = await bcrypt.hash(password, 10); 
    
        const user = new User({
            fullName,
            email,
            password:hashedPassword
           
        })
    
        await user.save();
    
        const accessToken = jwt.sign({id:user._id, email:user.email},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"1h",
        })

        return res.json({
            error:false,
            user: { id: user._id, email: user.email, fullName: user.fullName}, 
            accessToken,
            message:"Registation Successful "
        })
        
    } catch (err) {
        // Handle any errors
        console.error(err);
        return res.status(500).json({ error: true, message: "Server error" });
    }
  
    
})

router.post('/login', async (req, res)=>{
    const {email, password} = req.body;

    if(!email){
        return res.json({
            error: true,
            message:"Email is required."
        })
    }
    if(!password){
        return res.json({
            error: true,
            message:"Password is required."
        })
    }
     
    try {

    const userInfo = await User.findOne({email:email});
    console.log(userInfo);

    if(!userInfo){
        return res.status(400).json({message:"User not found."})
    }
    // Compare the entered password with the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, userInfo.password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            error: true,
            message: "Invalid Credentials"
        });
    }
    // Generate JWT with minimal user data (id and email)
        const accessToken = jwt.sign(
        { id: userInfo._id, email: userInfo.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }  // Token will expire in 1 hour
    );

    // Return the JWT and user information (excluding password)
    return res.json({
        error: false,
        message: "Login Successful",
        accessToken,
        user: {
            id: userInfo._id,
            email: userInfo.email,
            fullName: userInfo.fullName
        }
    }); 
        
    } catch (err) {
               // Handle any errors
               console.error(err);
               return res.status(500).json({ error: true, message: "Server error" });
    }
    

})

//Get User
router.get('/get-user', authenticateToken, async (req, res)=>{
    const {user} = req;

    const isUser = await User.findOne({_id:user.id});
    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user:{fullName:isUser.fullName, email:isUser.email, "_id": isUser._id, createdOn:isUser.createdOn},
        message:""
    })

})

//Add Note
router.post('/add-note',authenticateToken,async (req, res)=>{
 const {title, content, tags} = req.body;
 const {user} = req;

 console.log("user :", user);

 if(!title) {
    return res.status(400).json({error:true, message:"Title is require."})
 }
 if(!content) {
    return res.status(400).json({error:true, message:"Content is require."})
 }

 try{
    const note = new Note({
        title,
        content,
        tags:tags || [],
        userId:user.id,
    })
   
    await note.save();

    return res.json({
        error:false,
        note,
        message:"Note added successfully",
    })

    
 } catch (error) {
    return res.status(500).json({
        error: true,
        message:"Internal Server Error"
    })
 }
})
//Edit Note
router.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const {title, content, tags, isPinned} = req.body;
    const {user} = req;

    console.log("userId:", user.id);

    if(!title && !content && !tags){
        res.status(400).json({
            error: true,
            message:"No change has provided."
        })
    }

    try {

        const note = await Note.findOne({_id:noteId, userId:user.id});
    
        if(!note) {
            return res.status(404).json({message:"User is not found!"})
        }
         
        if(title) note.title = title;
        if(content) note.content = content;
        if(tags) note.tags = tags;
        if(isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note updated successfully",
        })
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Server error" });
    }

})

//Get all Notes
router.get('/get-all-notes/', authenticateToken, async (req, res)=>{
    const {user} = req;

    try {
        const notes = await Note.find({userId:user.id}).sort({isPinned:-1});
        return res.json({
            error:false,
            notes,
            message:"All notes retrived successfully."
        })
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server error" });
    }

})

//Delete Note
router.delete('/delete-note/:noteId',authenticateToken,async (req, res)=>{
    const notedId = req.params.noteId;
    const {user} = req;

    try {
        const note = await Note.findOne({_id:notedId, userId:user.id});
        console.log("note : " ,note)

        if(!note){
            return res.status(400).json({error:true, message:"Note not found"});
        }

        await Note.deleteOne({_id:notedId,userId:user.id});

        return res.json({
            error:false,
            message:"Note deleted successfully"
        })
        
    } catch (err) {
        res.status(500).json({
            error:true,
            message:"Internal Server Error."
        })
    }
})

// Update isPinned Vulue
router.put('/update-note-pinned/:noteId',authenticateToken, async (req, res)=>{

    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const {user} = req;

    try {

        const note = await Note.findOne({_id:noteId, userId:user.id});
    
        if(!note) {
            return res.status(404).json({error:true, message:"User is not found!"})
        }
         
        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note updated successfully",
        })
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Server error" });
    }


})

//Search Notes

router.get('/search-notes/', authenticateToken, async(req, res)=> {
    const {user} = req.user;
    const {query} = req.query;

    if(!query){
        return res.status(400).json({error:true, message:"Search query is required"})
    }

    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                {title:{$regex: new RegExp(query, "i")}},
                {content:{$regex: new RegExp(query, "i")}}
            ]

           

        });

        console.log(userId);

        return res.json({
            error:false,
            notes:matchingNotes,
            message:"Notes matching the search query retrived successfully."
        })
        
    } catch (error) {
        return res.status(500).json({
            error:true,
            message:"Internal Server Error."
        })
    }
})


module.exports = router;