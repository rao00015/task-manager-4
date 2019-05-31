const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to : email,
        from : 'chiragr6192@gmail.com',
        subject : 'Thanks for joining in',
        text : `Welcome to the App. ${name}. Let me know if you get along with the app`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to : email,
        from : 'chiragr6192@gmail.com',
        subject: 'Your account hase been removed',
        text : `We will miss you, ${name}. Please send us back an email and let us know if we did something wrong.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}