
var mediaRecorder
var datalist = []
const video1 = document.getElementById('video1')
const video2 = document.getElementById('video2')



navigator.mediaDevices.getUserMedia({audio:true,video:true})
.then((mediaStream)=>{
    video1.srcObject = mediaStream
    streaming()
})

function collectData(){

    var mediaSource = new MediaSource()
    video2.src = URL.createObjectURL(mediaSource)
    
    mediaSource.onsourceopen = () => {
            var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,opus"')
            var aaa = setInterval(()=>{
                try {
                    if (datalist.length){
                        sourceBuffer.appendBuffer(datalist.shift())
                    }
                } catch (error) {
                    console.log(error)
                    setTimeout(()=>datalist=[],50)
                    clearInterval(aaa)
                    collectData()
                }
            },100)
    }
}


function streaming(){
    myDeviceType = {mimeType:'video/webm; codecs="vp8,opus"'}
    mediaRecorder = new MediaRecorder(video1.srcObject,myDeviceType)
    mediaRecorder.start(100)
    mediaRecorder.ondataavailable = async e => {
        datalist.push(await  e.data.arrayBuffer())
            }
    mediaRecorder.onstop = e => {
        datalist.push('stop')
    }
        }
setTimeout(()=>{mediaRecorder.stop();mediaRecorder.start(500)},5000)
setInterval(()=>console.log(datalist),1000)
collectData()
