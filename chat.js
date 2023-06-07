var user_name
var device_setting
var videoBuffer
(async () => {device_setting = await detectWebcam()})();
const confirm_button = document.getElementById('confirm')
const input_user_name = document.getElementById('user_name')
const myvideo = document.getElementById('my-video')

input_user_name.onkeyup = (e) => {
    if (e.target.value){
        confirm_button.disabled=0
    } else {
        confirm_button.disabled=1
    }
}
confirm_button.onclick = startProcess

function startProcess(e){
    user_name = document.getElementById('user_name').value
    if (!user_name){
        alert('Must input something!!')
        return
    }

    const websocket = new WebSocket('wss://gintaku.xyz:9999')
    websocket.onopen = initConnect
    websocket.onmessage = processData
}

function initConnect(event){
    msg = {
        'type':'init',
        'name':user_name,
        'device':Object.keys(device_setting).length //length>1 == hasCamera
    }
    event.target.send(JSON.stringify(msg))
    navigator.mediaDevices
    .getUserMedia(device_setting)
    .then((mediaStream) => {
        myvideo.srcObject = mediaStream
        myDeviceType = Object.keys(device_setting).length>1 ? {mimeType:'video/webm; codecs="vp9,opus"'} : {mimeType:'audio/mpeg'}
        const mediaRecorder = new MediaRecorder(mediaStream,myDeviceType)
        mediaRecorder.start(100)
        mediaRecorder.ondataavailable = async e => {
            event.target.send(e.data)
        }
    })
}

function processData(event){
    data = JSON.parse(event.data)
    switch (data.type){
        case 'initChat':
            data.connectionsData.forEach(connectionData => {
                processNewConnection(connectionData)
            })
            break;
        case 'newConnection':
            processNewConnection(data.connectionData)
            break;
        case 'error':
            errorHandler(data)
    }
}


function processNewConnection(connectionData){
    partnerName = connectionData[0]
    partnerDeviceType = connectionData[1] == 'hasCamera' ? 'video/webm; codecs="vp9,opus"' : 'audio/mpeg'

    const sub_websocket = new WebSocket("wss://gintaku.xyz:9999/");
    sub_websocket.onopen = ()=>{
        sub_websocket.send(JSON.stringify({'type':'getOthersData','channel': partnerName}))
        dataBuffer = []
        videoElement = createVideoElement(partnerName)
        constmediaSource = new MediaSource()
        videoElement.src = URL.createObjectURL(mediaSource)
        mediaSource.onsourceopen = () => {
            console.log(partnerDeviceType)
            setInterval(()=>{
                if (!videoBuffer){
                    videoBuffer = mediaSource.addSourceBuffer(partnerDeviceType)
                }
                if (dataBuffer.length){
                    videoBuffer.appendBuffer(dataBuffer.shift())
                }
            },100)
        }
    }
    sub_websocket.onmessage = async (event)=>{
            dataBuffer.push(await event.data.arrayBuffer())
    }
}

function createVideoElement(id){
    video = document.createElement('video')
    video.setAttribute("id",id)
    video.setAttribute("width",480)
    video.setAttribute("height",300)
    video.setAttribute('autoplay',1)
    document.body.appendChild(video)
    return video
}

function detectWebcam() {
    return new Promise(resolve => {
        let md = navigator.mediaDevices;
        if (!md || !md.enumerateDevices) return resolve(null);
        md.enumerateDevices().then(devices => {
        if (devices.some(device => 'videoinput' === device.kind)){
            resolve({audio: true,video: { width: 480, height: 300 }})
        }else {return resolve({audio: true})}
        })
    })
}
  