const path=require('path')
const http= require('http')

const express=require('express');
const socketio=require('socket.io');

var Filter = require('bad-words');
const { DESTRUCTION } = require('dns');

const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
 }= require('../src/utils/users')

const publicDir= path.join(__dirname,'../public');

//Setting up the handlebars and app
const app= express()
const server = http.createServer(app)
const io=socketio(server)

const port=process.env.PORT 

app.use(express.static(publicDir))




//Data parsing
app.use(express.json());

io.on('connection', (socket)=>{
    console.log('New Connnection is established')
    
    socket.on('join',({username, room},callback)=>{
        const {error,user}=addUser({
            id: socket.id,
            username,
            room
        })
        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message',generateMessage('Admin', 'WelCome!'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

        //io.to.emit
        //socket.broadcast.to.emit
    })


    socket.on('sendMessage',(msg, callback)=>{
        const user= getUser(socket.id)
        console.log(msg)
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user= getUser(socket.id)
        if(! coords){
            return callback('Location not sent')
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', ()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    
})

app.get('',(req,res) =>{
    res.sendFile('/index.html')
})




server.listen(port,()=>{
    console.log('Server is up running at port 3000');
})
