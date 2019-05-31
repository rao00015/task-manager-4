const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./Task')

const userSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim : true
    },
    password : {
        type: String,
       required : true,
       minlength : 6,
       validate(value){
           if(value === 'password'){
               throw new Error('it cant contain password')
           }
       }
    },
    email:{
        require : true,
        type : String,
        trim : true,
        unique : true
    },
    tokens: [{
        token: {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
},{
    timestamps : true
})

userSchema.virtual('mytasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function() {
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}


userSchema.methods.getAuthorisedToken = async function() {
    const user = this

    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})

    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})
const User = mongoose.model('users', userSchema)
module.exports = User