const express = require('express')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../models/user')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')


const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(res, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|JPG)$/)){
            return cb(new Error('Please upload a jpg or png file'))
        }

        cb(undefined, true)
    }
})



router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
})  

router.post('/users/login', async (req, res) => {
    
    const user = await User.findByCredentials(req.body.email, req.body.password)
    
    try{
        const token = await user.getAuthorisedToken()
        res.status(200).send({user, token})
    } catch(e){
        res.send(e)
    }
})

router.post('/users/signup', async (req, res) => {
    const user = new User(req.body)

    try{
        const token = await user.getAuthorisedToken()
        sendWelcomeEmail(user.email, user.name)
        await user.save()
        res.send({user, token})
    } catch(e){
        return res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.status(200).send()
    } catch(e){
        res.status(500).send(e)
    }
})


router.post('/users/logoutall', auth, async(req, res) => {
    try{
        req.user.tokens = []

        await req.user.save()
        res.status(200).send()
    } catch(e){
        res.status(500).send(e)
    }
})


// router.get('/users', auth, async (req, res) => {

//     try{
//         const users = await User.find({})
//         res.status(201).send(users)
//     } catch(e){
//         res.status(400).send(e)
//     }

// })



router.patch('/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ["name" , "password"]

    const isValidUpdate = updates.every((update) => validUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send('invalid update')
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    } catch (e){
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {


    try{
        sendGoodbyeEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.status(200).send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = undefined 
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e){
        res.status(404).send()
    }

})

module.exports = router