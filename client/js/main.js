const chatForm = document.querySelector('#chat-form')
const chatMessages = document.querySelector('.chat-messages')

//get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

console.log(username, room)
const socket = io()

//Join  chatrooom
socket.emit('joinRoom', { username, room })

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room),
        outputUsers(users)
})
//the first 'message has to be exaactly what u emitted
socket.on('message', message => {
    console.log('hello', message)
    outputMessage(message)
    //every time we get a message we want to scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //get message text
    const msg = e.target.elements.msg.value
    //Emit message to server
    socket.emit('chatMessage', msg)
    //clear input
    e.target.elements.msg.value = ''
    //we focus on the input waiting for the what the user will type next using the focus method
    e.target.elements.msg.focus()

})

function outputMessage({ text, time, username }) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${username} <span>${time}</span></p>
    <p class="text">
       ${text}
    </p>`

    document.querySelector('.chat-messages').appendChild(div)
}

//Add roo name to dom
function outputRoomName(room) {
    document.querySelector('#room-name').innerText = room

}

//Add users to dom
function outputUsers(users) {
    document.querySelector('#users').innerHTML = `
    ${users.map(user => `<li> ${user.username}</li>`).join(" ")}
    `
}