constraints = {
    audio: true,
    video: { width: 480, height: 300 },
};
document.getElementById('confirm').onclick=()=>{
    const name =document.getElementById('yourname').value
    navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
        document.getElementById('my-camera').srcObject = mediaStream
        const websocket = new WebSocket("ws://localhost:9999/");
        websocket.addEventListener("open",()=>{
            websocket.send(JSON.stringify({'type':'init','name':name}))
            const recorderOptions = {
                mimeType: 'video/webm',
                videoBitsPerSecond: 200000 // 0.2 Mbit/sec.
        };
            const mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = e => {
                websocket.send(e.data)
            }
            setInterval(()=>{mediaRecorder.requestData()},5000)
                
    

            
            
        })
    
        websocket.addEventListener("message",async ({data})=>{
            console.log(data)
            const event = JSON.parse(data);
            switch (event.type){
                case "init":
                    event.connections.forEach(async connection => {
                        var video = document.createElement('video')
                        video.setAttribute("id",connection)
                        video.setAttribute("width",480)
                        video.setAttribute("height",300)
                        video.setAttribute('autoplay',1)
                        // video.setAttribute("id",connection)
                        document.body.appendChild(video)
                        const sub_websocket = new WebSocket("ws://localhost:9999/");
                        sub_websocket.addEventListener("open",()=>{
                            sub_websocket.send(JSON.stringify({'type':'getOthersData','channel': connection}))
                        })
                        sub_websocket.addEventListener("message",(event)=>{
                            // window.URL.revokeObjectURL(video.currentSrc)
                            video.src = window.URL.createObjectURL( event.data );
                            video.load();

                        })
                    });
                    
                    break
                case "new connection":
                    var video = document.createElement('video')
                    video.setAttribute("id",event.name)
                    video.setAttribute("width",480)
                    video.setAttribute("height",300)
                    video.setAttribute('autoplay',1)
                    document.body.appendChild(video)
                    const sub_websocket = new WebSocket("ws://localhost:9999/");
                    sub_websocket.addEventListener("open",()=>{
                        sub_websocket.send(JSON.stringify({'type':'getOthersData','channel': event.name}))
                    })    
                    const media = new MediaSource()
                    data  = window.URL.createObjectURL( media );
                    video.src= data
                    // media.addEventListener('sourceopen',()=>{
                        
                    //     const dd = media.addSourceBuffer('video/webm; codecs="vorbis,vp8""');
                    //     console.log(dd)
                    //     sub_websocket.addEventListener("message",(event)=>{
                    //         var fileReader = new FileReader();
                    //         fileReader.readAsArrayBuffer(event.data)
                    //         fileReader.onload = function(event) {
                    //             console.log(dd)
                    //             arrayBuffer = event.target.result;
                    //             var data = new Uint8Array(arrayBuffer);
                          
                    //             dd.appendBuffer(data)
                    //             video.load()}


                            // window.URL.revokeObjectURL(video.currentSrc)
                            // video.src = window.URL.createObjectURL( event.data );
                        
                    })

                })
                
                    break
            }
        })
        
      })
      
    }
    
