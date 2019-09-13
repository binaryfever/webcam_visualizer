let video;
let canvas;
let ctx;

const getImageDataFromCamera = () => {
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = w;
    canvas.height = h;
    
    //flip the image
    ctx.translate(w, 0);
    
    ctx.scale(-1, 1);

    //draw the video to the canvas
    ctx.drawImage(image, 0, 0);
}

const init = () => {
    video = document.querySelector("video");
    
    const options = {
        video: true,
        audio: false
    };

    //Capture the image from the camera
    navigator.mediaDevices.getUserMedia(options, (stream) =>{
        video.srcObject = stream;
        video.addEventListener("loadeddata", () =>{
            
        });
    }, (error) => {
        console.log(error);
    });
}

init();