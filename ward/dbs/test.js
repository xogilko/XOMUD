let stream;

async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('testkit_webcam');
        videoElement.srcObject = stream;
        observeVideoRemoval();
    } catch (error) {
        console.error('Error accessing webcam: ', error);
    }
}

function stopWebcam() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        stream = null;
        const videoElement = document.getElementById('testkit_webcam');
        videoElement.srcObject = null;
    }
}

function handleResize() {
    const videoElement = document.getElementById('testkit_webcam');
    const container = document.getElementById('testkit_webcam_span');
    videoElement.style.width = container.offsetWidth + 'px';
    videoElement.style.height = 'auto';
}

function observeVideoRemoval() {
    const videoElement = document.getElementById('testkit_webcam');
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(node => {
                    if (node.id === 'webcam') {
                        stopWebcam();
                        observer.disconnect();
                    }
                });
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function removeWebcam() {
    const webcamContainer = document.getElementById('testkit_webcam_span');
    if (webcamContainer) {
        webcamContainer.remove();
    }
}

window.addEventListener('resize', handleResize);
document.addEventListener('DOMContentLoaded', (event) => {
    startWebcam();
    handleResize();
});

window.addEventListener('beforeunload', stopWebcam);
