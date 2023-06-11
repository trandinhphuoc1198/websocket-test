var user_name
var device_setting
var mediaRecorder
var websocket

(async () => {device_setting = await detectWebcam()})();
const confirm_button = document.getElementById('confirm')
const input_user_name = document.getElementById('username')
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
    if (!document.getElementById('username').value){
        alert('Must input something!!')
        return
    }
    if (!websocket){
        websocket = new WebSocket('wss://gintaku.xyz:9999')
        websocket.onopen = initConnect
        websocket.onmessage = processData
        websocket.onclose = ()=>{
            alert('Websocket Server has stopped!!>> Reload page')
            setTimeout(()=>{location.reload()},3000)
        }
    } else{
        initConnect()
    }
}

function initConnect(){
    user_name = document.getElementById('username').value
    msg = {
        'type':'init',
        'name':user_name,
        'device':Object.keys(device_setting).length //length>1 == hasCamera
    }
    if (websocket.readyState){
        websocket.send(JSON.stringify(msg))
    } else{setTimeout( () => websocket.send(JSON.stringify(msg)),1000)}
}

function prepareStreaming(){
    confirm_button.remove()
    input_user_name.disabled=1
    document.getElementsByClassName('card')[0].classList.add('border-primary')
    navigator.mediaDevices
    .getUserMedia(device_setting)
    .then((mediaStream) => {
        myvideo.srcObject = mediaStream
        myDeviceType = Object.keys(device_setting).length>1 ? {mimeType:'video/webm; codecs="vp8,opus"'} : {mimeType:'audio/webm'}
        mediaRecorder = new MediaRecorder(myvideo.srcObject,myDeviceType)
        mediaRecorder.ondataavailable = e => {
            websocket.send(e.data)
        }
    })
}

function processData(event){
    data = JSON.parse(event.data)
    switch (data.type){
        case 'initChat':
            prepareStreaming()
            data.connectionsData.forEach(connectionData => {
                processNewConnection(connectionData,500)
            })
            if (data.connectionsData.length){
                setTimeout(startStreaming,1000)
            }
            break;
        case 'newConnection':
            mediaRecorder.stop()
            processNewConnection(data.connectionData)
            setTimeout(startStreaming,1000)
            break;
        case 'error':
            errorHandler(data)
    }
}


function processNewConnection(connectionData,delay=0){
        var partnerName = connectionData[0]
        var partnerDeviceType = connectionData[1] == 'hasCamera' ? 'video/webm; codecs="vp8,opus"' : 'audio/webm;codecs=opus'
        var updateVideo
        var dataBuffer = []
        var sub_websocket = new WebSocket("wss://gintaku.xyz:9999/");
        var videoElement = createVideoElement(partnerName)
        var videoBuffer
        var mediaSource

        sub_websocket.onopen = ()=>{
            sub_websocket.send(JSON.stringify({'type':'getOthersData','channel': partnerName}))
            mediaSource = new MediaSource()
            videoElement.src = URL.createObjectURL(mediaSource)
            mediaSource.onsourceopen = () => {
                updateVideo = setInterval(()=>{
                    try {
                        if (!videoBuffer){
                            videoBuffer = mediaSource.addSourceBuffer(partnerDeviceType)                        
                        }
                        if (dataBuffer.length){
                            videoBuffer.appendBuffer(dataBuffer.shift())
                        }
                    } catch (error) {
                        console.log('here1',error,partnerName)
                        clearInterval(updateVideo)
                    }
                },100)
            }

        setTimeout(()=>{
            sub_websocket.onmessage = async (event)=>{
            try {
                dataBuffer.push(await event.data.arrayBuffer())
            } catch (error) {
                console.log('here2', error)
                dataBuffer.push(event.data)                
            }
        }
    },delay)
        sub_websocket.onclose = () => {
            document.getElementById('col-'+partnerName).remove()
        }
    }
}

function errorHandler(data){
    switch (data.msg){
        case 'duplicated name':
            alert('Your name have been used, use other name!!')
            input_user_name.focus()
    }
}

function createVideoElement(id){
    original_node = document.getElementsByClassName('col')[0]
    clone_node = original_node.cloneNode(true)
    clone_node.id = 'col-' + id
    clone_node.children[0].classList.remove('border-primary')
    clone_node.children[0].classList.add('border-danger')
    clone_node.children[0].children[0].id = id
    clone_node.children[0].children[1].children[0].innerHTML = id
    clone_node.children[0].children[1].children[0].classList.add('form-control')
    original_node.parentNode.insertBefore(clone_node, null);

    return document.getElementById(id)
}

function detectWebcam() {
    return new Promise(resolve => {
        let md = navigator.mediaDevices;
        if (!md || !md.enumerateDevices) return resolve(null);
        md.enumerateDevices().then(devices => {
        if (devices.some(device => 'videoinput' === device.kind)){
            resolve({audio: true, video:{width:480,height:300}})
        }else {return resolve({audio: true})}
        })
    })
}

function startStreaming(){
    mediaRecorder.start(100)
}



function getSupportedMimeTypes(media, types, codecs) {
    const isSupported = MediaSource.isTypeSupported;
    const supported = [];
    types.forEach((type) => {
      const mimeType = `${media}/${type}`;
      codecs.forEach((codec) => [
          `${mimeType};codecs=${codec}`,
          `${mimeType};codecs=${codec.toUpperCase()}`,
        ].forEach(variation => {
          if(isSupported(variation)) 
              supported.push(variation);
      }));
      if (isSupported(mimeType))
        supported.push(mimeType);
    });
    return supported;
  };
  
  
const videoTypes = [,"webm", "ogg", "mp4", "x-matroska"];
const audioTypes = ["webm", "ogg", "mp3", "x-matroska"];
const codecs = ["should-not-be-supported","vp9", "vp9.0", "vp8", "vp8.0", "avc1", "av1", "h265", "h.265", "h264", "h.264", "opus", "pcm", "aac", "webm", "mp4a"];

const supportedVideos = getSupportedMimeTypes("video", videoTypes, codecs);
const supportedAudios = getSupportedMimeTypes("audio", audioTypes, codecs);
console.log(supportedVideos)
console.log(supportedAudios)

    
    