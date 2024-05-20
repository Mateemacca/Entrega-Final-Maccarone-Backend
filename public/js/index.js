const socket = io();

let userName;

Swal.fire({
    title: 'Ingresa su nombre',
    input: 'text',
    inputValidator: (value) => {
        if (!value) return 'Por favor ingresa un nombre';
    },
}).then((data) => {
    userName = data.value;
    socket.emit('newUser', userName);
});

const inputData = document.getElementById('inputData');
const outputData = document.getElementById('outputData');

inputData.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        if (inputData.value.trim().length > 0) {
            socket.emit('message', { user: userName, data: inputData.value });
            inputData.value = '';
        }
    }
});

socket.on('storedMessages', (storedMessages) => {
    let messages = '';
    storedMessages.forEach((message) => {
        messages += `${message.user} dice: ${message.data}<br />`;
    });

    outputData.innerHTML = messages;
});
socket.on('messageLogs', (data) => {
    data.forEach((message) => {
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `${message.user} dice: ${message.data}`;
      outputData.appendChild(messageElement);
    });
  

  });




socket.on('notification', (user) => {
    Swal.fire({
        text: `${user} se conecto`,
        toast: true,
        position: 'top-right',
    });
});



    
   