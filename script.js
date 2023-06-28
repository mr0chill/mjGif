document.addEventListener('DOMContentLoaded', function() {
    let speedSlider = document.getElementById('speed-slider');
    let speedLabel = document.getElementById('speed-label');
    
    let speedMap = {
        1: 1000,
        2: 500,
        3: 200,
        4: 100,
        5: 50
    };
    
    let labelMap = {
        1: 'Speed: Super slow',
        2: 'Speed: Slow',
        3: 'Speed: Normal',
        4: 'Speed: Fast',
        5: 'Speed: Super fast'
    };

    let speed = speedMap[speedSlider.value];
    speedLabel.textContent = labelMap[speedSlider.value];

    speedSlider.addEventListener('input', function() {
        speed = speedMap[speedSlider.value];
        speedLabel.textContent = labelMap[speedSlider.value];
    });

    document.getElementById('create-gif').addEventListener('click', async function() {
        let files = document.getElementById('image-input').files;

        let firstImage = await createImageBitmap(files[0]);
        let gif = new GIF({
            workerScript: '/gif.worker.js',
            workers: 2,
            quality: 10,
            width: firstImage.width / 2,
            height: firstImage.height / 2
        });

        for (let file of files) {
            let img = await createImageBitmap(file);
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            let frameWidth = img.width / 2;
            let frameHeight = img.height / 2;

            let frames = [
                context.getImageData(0, 0, frameWidth, frameHeight),
                context.getImageData(frameWidth, 0, frameWidth, frameHeight),
                context.getImageData(0, frameHeight, frameWidth, frameHeight),
                context.getImageData(frameWidth, frameHeight, frameWidth, frameHeight)
            ];

            for (let frame of frames) {
                gif.addFrame(frame, {delay: speed});
            }
        }

        gif.on('finished', function(blob) {
            let url = URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.href = url;
            link.download = 'gifpanel.gif';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        gif.render();
    });
});



document.getElementById('upload-button').addEventListener('click', function() {
    document.getElementById('image-input').click();
});

document.getElementById('image-input').addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('create-gif').style.display = 'block';
        document.getElementById('upload-button').style.display = 'none';
    } else {
        document.getElementById('create-gif').style.display = 'none';
    }
});
