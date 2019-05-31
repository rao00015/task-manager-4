const mongoose = require('mongoose')
const validator = require('validator')


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser : true,
    useCreateIndex : true
})



// const practiceCoding = new Task({
//     description : 'Practice Coding to improve it'
// })

// practiceCoding.save().then(() => {
//     console.log(practiceCoding)
// }).catch((error) => {
//     console.log('error!: ' + error)
// })



// const rahul = new User({
//     name : 'Rahul',
//     password : 'pass'
// })



// rahul.save().then(() => {
//     console.log(rahul)
// }).catch((error) => {
//     console.log('error!: ' + error)
// })