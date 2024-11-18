//HTML PORTION

<div id="testkit_scroll_container">
    <div class="testkit_scroll_video_wrapper" data-index="0">
        <video class="testkit_scroll_video" loop playsinline>
            <source src="" type="video/mp4">
        </video>
    </div>
    <div class="testkit_scroll_video_wrapper" data-index="1">
        <video class="testkit_scroll_video" loop playsinline>
            <source src="" type="video/mp4">
        </video>
    </div>
    <div class="testkit_scroll_video_wrapper" data-index="2">
        <video class="testkit_scroll_video" loop playsinline>
            <source src="" type="video/mp4">
        </video>
    </div>
</div>

// JS PORTION

const testkit_scroll_videoUrls = [
    'https://samples-files.com/samples/video/mp4/sample1-480x270.mp4',
    'https://filesampleshub.com/download/video/mp4/sample1.mp4',
    'https://onlinetestcase.com/wp-content/uploads/2023/06/1MB.mp4',
    'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'https://download.samplelib.com/mp4/sample-5s.mp4'
];

const testkit_scroll_texts = [
    "Tap to Change",
    "Interactive Text",
    "Click Me!",
    "Touch for Effects",
    "Try Me!"
];

const testkit_scroll_state = {
    currentVideoIndex: 0,
    wrappers: null,
    videos: null,
    lastScrollPosition: 0
};

function testkit_scroll_handleScroll() {
    const container = document.getElementById('testkit_scroll_container');
    const currentScroll = container.scrollTop;
    const scrollDelta = currentScroll - testkit_scroll_state.lastScrollPosition;
    
    if (Math.abs(scrollDelta) > 50) {
        const currentVideo = testkit_scroll_state.videos[1];
        currentVideo.pause();
        
        if (scrollDelta > 0) {
            testkit_scroll_state.currentVideoIndex = (testkit_scroll_state.currentVideoIndex + 1) % testkit_scroll_videoUrls.length;
        } else {
            testkit_scroll_state.currentVideoIndex = (testkit_scroll_state.currentVideoIndex - 1 + testkit_scroll_videoUrls.length) % testkit_scroll_videoUrls.length;
        }
        
        const source = currentVideo.querySelector('source');
        const videoUrl = testkit_scroll_videoUrls[testkit_scroll_state.currentVideoIndex];
        source.src = videoUrl;
        source.type = videoUrl.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
        
        currentVideo.load();
        currentVideo.play().catch(e => console.log('Play error:', e));
        
        updateTextOverlay(testkit_scroll_state.currentVideoIndex);
        
        container.scrollTop = 400;
        testkit_scroll_state.lastScrollPosition = container.scrollTop;
    }
}

function updateTextOverlay(index) {
    document.querySelectorAll('.testkit_scroll_text_overlay').forEach(overlay => {
        overlay.textContent = testkit_scroll_texts[index];
        overlay.style.animation = 'none';
        overlay.offsetHeight;
        overlay.style.animation = 'floatText 2s ease-in-out';
    });
}

function testkit_scroll_initializeVideos() {
    testkit_scroll_state.wrappers = document.querySelectorAll('.testkit_scroll_video_wrapper');
    testkit_scroll_state.videos = document.querySelectorAll('.testkit_scroll_video');
    
    const middleVideo = testkit_scroll_state.videos[1];
    const source = middleVideo.querySelector('source');
    const videoUrl = testkit_scroll_videoUrls[0];
    source.src = videoUrl;
    source.type = videoUrl.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
    
    middleVideo.load();
    middleVideo.play().catch(e => console.log('Play error:', e));
    updateTextOverlay(0);
}

const testkit_scroll_container = document.getElementById('testkit_scroll_container');

if (testkit_scroll_container) {
    testkit_scroll_container.style.width = '325px';
    testkit_scroll_container.style.height = '400px';
    testkit_scroll_container.style.overflowY = 'scroll';
    testkit_scroll_container.style.position = 'relative';
    testkit_scroll_container.style.margin = '0 auto';
    testkit_scroll_container.style.backgroundColor = '#000';
    testkit_scroll_container.style.aspectRatio = '325 / 400';
    
    const wrappers = document.querySelectorAll('.testkit_scroll_video_wrapper');
    wrappers.forEach(wrapper => {
        wrapper.style.height = '100%';
        wrapper.style.width = '100%';
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';
        wrapper.style.backgroundColor = '#000';
        wrapper.style.cursor = 'pointer';
        
        const overlay = document.createElement('div');
        overlay.className = 'testkit_scroll_text_overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.color = 'white';
        overlay.style.fontSize = '24px';
        overlay.style.fontWeight = 'bold';
        overlay.style.textAlign = 'center';
        overlay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
        overlay.style.zIndex = '2';
        overlay.style.width = '80%';
        overlay.style.cursor = 'pointer';
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        const fonts = ['Arial', 'Verdana', 'Helvetica', 'Trebuchet MS', 'Georgia'];
        let colorIndex = 0;
        let fontIndex = 0;
        
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            colorIndex = (colorIndex + 1) % colors.length;
            fontIndex = (fontIndex + 1) % fonts.length;
            overlay.style.color = colors[colorIndex];
            overlay.style.fontFamily = fonts[fontIndex];
            
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            overlay.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            setTimeout(() => {
                overlay.style.transform = 'translate(-50%, -50%)';
            }, 500);
        });
        
        wrapper.appendChild(overlay);
        
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper || e.target.tagName === 'VIDEO') {
                const video = wrapper.querySelector('video');
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
    });
    
    const videos = document.querySelectorAll('.testkit_scroll_video');
    videos.forEach(video => {
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
        video.muted = false;
        video.playsInline = true;
        video.controls = false;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.pause();
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatText {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    testkit_scroll_initializeVideos();
    testkit_scroll_container.scrollTop = 400;
    testkit_scroll_container.addEventListener('scroll', testkit_scroll_handleScroll);
}