const users =[]

//adduser , remove user

// get user, get users in room
const addUser = ({id,username,room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
     //validate

     if(!username  || !room){
         return {
            error: 'Username and room are required'
         }
     }
     // Check for existing user
     const existingUser =users.find((user)=>{
         return user.room === room && user.username === username
     })
     // validate user
     if(existingUser){
         return {
             error : 'Username in use'
         }
     }
     //save the user

     const user= {id,username,room}
     users.push(user)
     return {user}
}
const removeUser= (id)=>{
    const index = users.findIndex((user) => user.id === id)
    if(index != -1){
        return users.splice(index, 1)[0]
    }
}
 const getUser = (id)=>{
     return users.find((user)=>user.id===id)
 }
const getUsersInRoom = (room) => {
    room= room.trim().toLowerCase()
    return users.filter((user)=> user.room===room)
}




 module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
 }