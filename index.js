constraints = {
    audio: true,
    video: { width: 480, height: 300 },
};
const websocket = new WebSocket("ws://localhost:9999/");
var websocket2;
navigator.mediaDevices
.getUserMedia(constraints)
.then((mediaStream) => {
    document.getElementById('my-camera').srcObject = mediaStream
    
    
    
    websocket.addEventListener("open",()=>{
        websocket.send(JSON.stringify({'type':'init','name':'abdw32dqc'}))
        setInterval(() => {
            media = new MediaStream()
            const track = mediaStream.getVideoTracks()[0];
            media.addTrack(track)
            const recorderOptions = {
                mimeType: 'video/webm',
                videoBitsPerSecond: 200000 // 0.2 Mbit/sec.
              };
            const mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);
            mediaRecorder.start(5000);
            mediaRecorder.ondataavailable = (event) =>{

                websocket.send(event.data)
            }

          }, 5000);
        
        
    })

    websocket.addEventListener("message",async ({data})=>{
        console.log(data)
        const event = JSON.parse(data);
        switch (event.type){
            case "init":
                event.connections.forEach(async connection => {
                    console.log(connection)
                    video = document.createElement('video')
                    video.setAttribute("id",connection)
                    video.setAttribute("autoplay",true)
                    document.body.appendChild(video)
                    websocket2 = new WebSocket("ws://localhost:9999/");
                    websocket2.addEventListener("open",()=>{
            
                    websocket2.send(JSON.stringify({'type':'getOthersData','channel': connection}))

                    websocket2.addEventListener("message",({data})=>{
                        const datasrc = URL.createObjectURL( data );
                        video.src = datasrc;
                        video.load();
                
                        })
                    })
                    console.log(1,websocket2)                    
                });
                
                break
            case "new connection":
                video = document.createElement('video')
                video.setAttribute("id",event.name)
                video.setAttribute("autoplay",true)
                document.body.appendChild(video)
                websocket2 = new WebSocket("ws://localhost:9999/");
                websocket2.addEventListener("open",()=>{
        
                websocket2.send(JSON.stringify({'type':'getOthersData','channel': event.name}))


                websocket2.addEventListener("message",({data})=>{
                    const datasrc = URL.createObjectURL( data );
                    video.src = datasrc;
                    video.load();
                })
                console.log(2,websocket2)

                
            })
                break
        }
        console.log(3,websocket2)
    })
    
  })
  .catch((err) => {

  });

function getOthersData(name){
    return new Promise(resolve => {
        const websocket = new WebSocket("ws://localhost:9999/");
        websocket.addEventListener("open",()=>{
            
            websocket.send(JSON.stringify({'type':'getOthersData','channel': name}))
            websocket.addEventListener("message",({data})=>{
                const newObjectUrl = URL.createObjectURL( data );
                resolve(newObjectUrl)
                
            })
        })

    })
}
