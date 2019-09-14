const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let scene;
let renderer;
let camera;
let particles;
let clock;
let width;
let height;
let video;
let videoWidth;
let videoHeight;
let imageCache;

const videoOptions = {
    video: true,
    audio: false
};

const init = () => {
    
    //setup the scene for three js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    //setup the renderer
    renderer = new THREE.WebGLRenderer();

    //add the three js created canvas to the body
    document.querySelector("body").appendChild(renderer.domElement);

    clock = new THREE.Clock();

    //Create the three js camera
    const fov = 45;
    const aspect = width/height;
    const near = 0.01;
    const far = 10000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    const z = Math.min(width, height);

    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);

    scene.add(camera);

    navigator.mediaDevices.getUserMedia(videoOptions, (stream) => {
        video = document.querySelector("video");
        video.srcObject = stream;
        video.addEventListener("loadeddata", () => {
            videoWidth = video.videoWidth;
            videoHeight = video.videoWidth;

            createParticles();
        });
    });

    draw();

}

const createParticles = () => {
    const imageData = getImageData(video);
    const geometry = new THREE.Geometry();

    geometry.morphAttributes = {};

    const material = new THREE.PointsMaterial({
        size: 1,
        color: 0xff3b6c
    });

    for (let y = 0, height = imageData.height; y < height; y += 1) {
        for (let x = 0, width = imageData.width; x < width; x += 1) {
            const vertex = new THREE.Vector3(
                x - imageData.width / 2,
                -y + imageData.height / 2,
                0
            );
            geometry.vertices.push(vertex);
        }
    }

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

const getImageData = (image) => {
    if (useCache && imageCache) {
        return imageCache;
    }

    const imageWidth = image.videoWidth;
    const imageHeight = image.videoHeight;

    canvas.width = imageWidth;
    canvas.height = imageHeight;

    //flip the image
    ctx.translate(imageWidth, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(image, 0, 0);
    imageCache = ctx.getImageData(0, 0, imageWidth, imageHeight);
    return imageCache;
}

const draw = (t) =>{
    clock.getDelta();
    const time = clock.elapsedTime;

    let r;
    let g;
    let b;

    // video
    if (particles) {
        particles.material.color.r = 1 - r;
        particles.material.color.g = 1 - g;
        particles.material.color.b = 1 - b;

        const density = 2;
        const useCache = parseInt(t) % 2 === 0;  // To reduce CPU usage.
        const imageData = getImageData(video, useCache);
        for (let i = 0, length = particles.geometry.vertices.length; i < length; i++) {
            const particle = particles.geometry.vertices[i];
            if (i % density !== 0) {
                particle.z = 10000;
                continue;
            }
            let index = i * 4;
            let gray = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            let threshold = 300;
            if (gray < threshold) {
                if (gray < threshold / 3) {
                    particle.z = gray * r * 5;

                } else if (gray < threshold / 2) {
                    particle.z = gray * g * 5;

                } else {
                    particle.z = gray * b * 5;
                }
            } else {
                particle.z = 10000;
            }
        }
        particles.geometry.verticesNeedUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(draw);
}

const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

window.addEventListener("resize", onResize);

init();