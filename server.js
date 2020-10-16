const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomusers
} = require('./utils/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)
//set static server
app.use(express.static(path.join(__dirname, 'client')))

const botName = 'chatcord bot'


//Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        //socket.io is sent to the single client connecting
        socket.emit('message', formatMessage(botName, 'Welcome to chat chord'));

        //Broadcast when  user connects to everyone except client
        //connecting
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //after someone has joined the chat we send the users  in the room
        io.to(user.room)
            .emit('roomUsers', {
                room: user.room,
                users: getRoomusers(user.room)
            })

    })



    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        console.log(user)
        if (user) {
            io
                .to(user.room)
                .emit('message', formatMessage(user.username, msg))
        }
    })

    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io
                .to(user.room)
                .emit('message', formatMessage(botName, `${user.username} has left the chat`))

            //after someone has left the chat we send the users  in the room
            io.to(user.room)
                .emit('roomUsers', {
                    room: user.room,
                    users: getRoomusers(user.room)
                })
        }
    })
});

const PORT = process.env.PORT || 3000

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })