const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/Task')
const User = require('../models/user')




router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner : req.user._id
    })

    try{
        await task.save()
        res.send(task)
    } catch (e){
        res.send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        await req.user.populate({
            path : 'mytasks',
            match,
            options:{
                sort
            }
    }).execPopulate()
        res.status(201).send(req.user.mytasks)
    } catch(e){
        res.status(400).send('error')
    }

})



router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try{
        const task = await Task.findOne({_id, owner : req.user._id})
       
        if(!task){
            return res.status(404).send
        }

        res.send(task)
    } catch(e){
        res.status(404).send(e)
    }
    
})


router.patch('/tasks/:id', async (req, res) => {

    const reqTasks = Object.keys(req.body)
    const validTasks = ["description", "completed"]

    const isValidTask = reqTasks.every((reqTask) => validTasks.includes(reqTask))

    if(!isValidTask){
        return res.status(404).send('Invalid Task Field')
    }

    try{

        const task = await Task.findOne({_id : req.params.id, owner: req.user.id})

         

        if(!task){
            return res.status(404).send()
        }

        await reqTasks.forEach((keys) => task[keys] = req.body[keys])
         task.save()
        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})



router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        const task = await Task.findOneAndDelete(  {_id, owner : req.user.id})
        
        if(!task){
           return res.status(404).send('task not found')
        } 

        res.status(200).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router