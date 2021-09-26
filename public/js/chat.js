 const socket=io()

 //Elements 
 const $messageForm= document.querySelector('#messageForm')
 const $messageFormInput= $messageForm.querySelector('input')
 const $messageFormButton= $messageForm.querySelector('button')
 const $sendLocationButton= document.querySelector('#sendLocation')
 const $messages=document.querySelector('#messages');
 const $sidebar=document.querySelector('#sidebar')

 //templates
 const messageTemplate= document.getElementById('message-template').innerHTML
const locationTemplate= document.getElementById('location-template').innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML
//Options

const {username,room}=Qs.parse(location.search ,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    //New message element
    const $newMessage= $messages.lastElementChild

    //get the height of the new message
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessageMargin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight= $messages.offsetHeight

    //heaight of message container
    const containerHeight= $messages.scrollHeight
    //How far have
    const scrollOffset= $messages.scrollTop +visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop= $messages.scrollHeight
    }
    //

    
}

 socket.on('message',(message)=>{
     console.log(message)
     var rendered = Mustache.render(messageTemplate, { 
         username: message.username,
         message: message.text,
         createdAt:moment(message.createdAt).format('h:mm a')
    });
     $messages.insertAdjacentHTML('beforeend',rendered);
     autoscroll()   
 })


 socket.on('locationMessage',(urlmessage)=>{
    console.log(urlmessage)
    var rendered = Mustache.render(locationTemplate, { 
        username: urlmessage.username,
        url:urlmessage.url,
        createdAt: moment(urlmessage.createdAt).format('h:mm a')
    });
     $messages.insertAdjacentHTML('beforeend',rendered);
     autoscroll()
 })


 socket.on('roomData',(data) =>{
     console.log(data);
     var rendered = Mustache.render(sidebarTemplate, { 
        room:data.room,
        users:data.users
    });
    $sidebar.innerHTML=rendered
   
 })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    const msg= e.target.elements.message.value 
    socket.emit('sendMessage',msg ,(error)=>{

        //enable button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value= ''
        $messageFormInput.focus()

        if(error){
             return console.log(error);
        }
        console.log('The message was delivered!.')
    })
})

$sendLocationButton.addEventListener('click',()=>{

    $sendLocationButton.setAttribute('disabled','disabled')
    if(! navigator.geolocation){
        return alert('Geolocation is not supported by your browser')

    }

    navigator.geolocation.getCurrentPosition((position)=>{
        
        
        socket.emit('sendLocation', {
            latitude:position.coords.latitude,
            longitude: position.coords.longitude,
        },(error)=>{
            if(error){
                return console.log(error)
            }
            console.log('Location shared!');
            $sendLocationButton.removeAttribute('disabled')

        })

    })   
})

socket.emit('join',{username,room}, (error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})

