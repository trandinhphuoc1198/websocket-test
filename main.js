let a = 0
var datalist = []
var videoBuffer
const video1 = document.getElementById('video1')
const video2 = document.getElementById('video2')


const mediaSource = new MediaSource()
video2.src = URL.createObjectURL(mediaSource)
mediaSource.addEventListener('sourceopen', ()=>{
    setInterval(()=>{
        if (!videoBuffer){
            videoBuffer = mediaSource.addSourceBuffer('audio/mpeg')
            console.log('a')
        }
        if (datalist.length){
            videoBuffer.appendBuffer(datalist.shift())
        }
    },100)
        // // if (!videoBuffer){
        // //     videoBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9,opus"')
        // // }
        // // if (datalist.length){
        // //     videoBuffer.appendBuffer(datalist.shift())
        // // }
    
        // // videoBuffer.addEventListener("updateend", ()=>{
        // //     if (datalist.length){
        // //         videoBuffer.appendBuffer(datalist.shift())
        // //     }else {
        // //         // mediaSource.endOfStream();
        // //     }
        // })
    })


navigator.mediaDevices.getUserMedia({audio:true,video:false})
.then((mediaStream)=>{
    video1.srcObject = mediaStream

    const recorder = new MediaRecorder(mediaStream)
    recorder.start(100)
    recorder.ondataavailable = async e => {
        datalist.push( await e.data.arrayBuffer())
    }
})


function detectWebcam() {
    return new Promise(resolve => {
        let md = navigator.mediaDevices;
        if (!md || !md.enumerateDevices) return resolve(null);
        md.enumerateDevices().then(devices => {
        if (devices.some(device => 'videoinput' === device.kind)){
            resolve({    audio: true,
                        video: { width: 480, height: 300 }
                    })
          }
        return resolve({audio: true})
        })
    })
}
  
