var ebml = require('ts-ebml');
const decoder = new ebml.Decoder();
const reader = new ebml.Reader();
const tools =  ebml.tools;

var mediaRecorder
var datalist = []
const video1 = document.getElementById('video1')
const video2 = document.getElementById('video2')
const video3 = document.getElementById('video3')

setInterval(()=>{
    console.log(datalist)
    if (datalist.length>0){
        var oldData = video2.currentSrc
        video3.src=oldData
        console.log(video3.width)

        video3.style.opacity="1"
        video3.width="640"
        console.log(video3.width)
        video2.width="1"
        video2.style.opacity="0"

        var newData = URL.createObjectURL(datalist.shift())
        video2.src = newData
        video3.width="1"
        video3.style.opacity="0"
        video2.style.opacity="1"
        video2.width="640"

        // URL.revokeObjectURL(oldData)
    }
},1000)


navigator.mediaDevices.getUserMedia({audio:true,video:true})
.then((mediaStream)=>{
    video1.srcObject = mediaStream
})


function streaming(){
    myDeviceType = {mimeType:'video/webm; codecs="vp9,opus"'}
    mediaRecorder = new MediaRecorder(video1.srcObject,myDeviceType)
    mediaRecorder.start(2000)
    mediaRecorder.ondataavailable = async e => {
        buffer = await  e.data.arrayBuffer()
        data = decoder.decode(buffer)
        data.forEach(element => {
            reader.read(element);
        });
        reader.stop();
        var refinedMetadataBuf = tools.makeMetadataSeekable(
            reader.metadatas, reader.duration, reader.cues);
            var body = buffer.slice(reader.metadataSize);
            const result = new Blob([refinedMetadataBuf, body],
                {type: e.data.type});

                datalist.push( result )
            }
        }

setTimeout(()=>{
    streaming()
},1000)
        setTimeout(()=>{
            mediaRecorder.stop()
            console.log('stop succsess ', mediaRecorder)
            setTimeout(()=>{streaming();console.log('statr again',mediaRecorder)},5000)
},4000)