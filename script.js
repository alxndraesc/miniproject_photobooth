// Photobooth App JavaScript
class PhotoboothApp {
    constructor() {
        console.log('🚀 Initializing PhotoboothApp...');
        
        console.log('🔧 Getting DOM elements...');
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.stream = null;
        this.currentFilter = 'none';
        this.currentFrame = 'strip';
        this.capturedPhotos = [];
        this.customFrames = [];
        this.multiShotPhotos = []; // For film strip multiple shots
        this.isCapturingMultiShot = false;
        this.currentFrameColor = '#ffffff'; // Default white color for frames
        this.cameraInactivityTimer = null; // For auto-stopping camera
        this.mirrorCamera = true; // Mirror camera preview for natural feel
        
        // Initialize device info immediately
        this.deviceInfo = null;
        this.detectDeviceType();
        
        // Debug element availability
        console.log('DOM elements found:', {
            video: !!this.video,
            canvas: !!this.canvas,
            context: !!this.ctx,
            startButton: !!document.getElementById('start-camera'),
            captureButton: !!document.getElementById('capture-photo'),
            downloadButton: !!document.getElementById('download-photo')
        });
        
        if (!this.video) {
            console.error('❌ Video element not found');
        }
        
        if (!this.canvas) {
            console.error('❌ Canvas element not found');
        }
        
        if (!this.ctx) {
            console.error('❌ Canvas context not available');
        }
        
        console.log('🎯 Starting initialization...');
        this.init();
    }

    init() {
        console.log('🎛️ Setting up event listeners...');
        this.bindEvents();
        
        console.log('🗑️ Clearing photos for privacy...');
        this.clearPhotosOnPageLoad(); // Clear photos for privacy on each page load
        
        console.log('🖼️ Loading custom frames...');
        this.loadCustomFrames();
        
        console.log('⌨️ Initializing typing animation...');
        this.initTypingAnimation();
        
        console.log('🪞 Initializing mirror button...');
        this.initMirrorButton();
        
        console.log('✅ App initialization complete');
    }

    detectDeviceType() {
        // Detect if we're on mobile or desktop for better camera handling
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?=.*Tablet)/i.test(userAgent);
        
        this.deviceInfo = {
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet
        };
        
        console.log('Device detected:', this.deviceInfo);
    }

    initMirrorButton() {
        const mirrorBtn = document.getElementById('mirror-toggle');
        if (this.mirrorCamera) {
            mirrorBtn.classList.add('active');
            mirrorBtn.textContent = '🪞 MIRROR ON';
        } else {
            mirrorBtn.classList.remove('active');
            mirrorBtn.textContent = '🪞 MIRROR OFF';
        }
    }

    getCameraConstraints() {
        // Ensure deviceInfo is available, detect if not
        if (!this.deviceInfo) {
            console.warn('⚠️ Device info not available, detecting now...');
            this.detectDeviceType();
        }
        
        // Provide different camera constraints based on device type
        const baseConstraints = {
            video: {
                facingMode: 'user',
                frameRate: { ideal: 30, max: 60 }
            },
            audio: false
        };

        if (this.deviceInfo && this.deviceInfo.isMobile) {
            // Mobile devices - prioritize compatibility
            baseConstraints.video = {
                ...baseConstraints.video,
                width: { ideal: 1280, min: 640, max: 1920 },
                height: { ideal: 720, min: 480, max: 1080 },
                aspectRatio: { ideal: 16/9 }
            };
        } else if (this.deviceInfo && this.deviceInfo.isTablet) {
            // Tablets - higher quality but still mobile-optimized
            baseConstraints.video = {
                ...baseConstraints.video,
                width: { ideal: 1920, min: 1280, max: 2560 },
                height: { ideal: 1080, min: 720, max: 1440 },
                aspectRatio: { ideal: 16/9 }
            };
        } else {
            // Desktop/Laptop - highest quality
            baseConstraints.video = {
                ...baseConstraints.video,
                width: { ideal: 1920, min: 1280, max: 3840 },
                height: { ideal: 1080, min: 720, max: 2160 },
                aspectRatio: { ideal: 16/9 }
            };
        }

        return baseConstraints;
    }

    bindEvents() {
        // Camera controls with enhanced privacy
        document.getElementById('start-camera').addEventListener('click', () => {
            const startBtn = document.getElementById('start-camera');
            if (startBtn.textContent === 'START CAMERA') {
                this.startCamera();
            } else {
                this.stopCamera();
            }
        });
        document.getElementById('capture-photo').addEventListener('click', () => {
            this.capturePhoto();
            this.resetCameraInactivityTimer(); // Reset timer on capture
        });
        document.getElementById('download-photo').addEventListener('click', () => this.downloadLatestPhoto());

        // Mirror toggle button
        document.getElementById('mirror-toggle').addEventListener('click', () => this.toggleCameraMirror());

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectFilter(e.target.closest('.filter-btn'));
                this.resetCameraInactivityTimer(); // Reset timer on filter change
            });
        });

        // Frame buttons
        document.querySelectorAll('.frame-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectFrame(e.target.closest('.frame-btn'));
                this.resetCameraInactivityTimer(); // Reset timer on frame change
            });
        });

        // Frame color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectFrameColor(e.target.closest('.color-btn'));
                this.resetCameraInactivityTimer(); // Reset timer on user interaction
            });
        });

        // Add interaction listeners to reset camera timer
        document.addEventListener('click', () => this.resetCameraInactivityTimer());
        document.addEventListener('keydown', () => this.resetCameraInactivityTimer());
    }

    loadCustomFrames() {
        // Placeholder for custom frames functionality
        // This could load frames from a frames folder in the future
        this.customFrames = [];
        console.log('Custom frames loaded (placeholder)');
    }

    initTypingAnimation() {
        const titleElement = document.querySelector('.title');
        if (!titleElement) {
            console.warn('Title element not found');
            return;
        }
        
        const text = 'Mood – Classic. Retro. Pop.';
        let index = 0;
        
        // Add cursor styling
        titleElement.style.borderRight = '3px solid var(--sage-600)';
        titleElement.style.paddingRight = '5px';
        
        function typeCharacter() {
            if (index < text.length) {
                titleElement.textContent = text.slice(0, index + 1);
                index++;
                setTimeout(typeCharacter, 150); // 150ms between each character
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    titleElement.style.borderRight = 'none';
                    titleElement.style.paddingRight = '0';
                }, 1000);
            }
        }
        
        // Start typing after a brief delay
        setTimeout(typeCharacter, 500);
    }

    stopCamera() {
        if (this.stream) {
            // Clear inactivity timer
            if (this.cameraInactivityTimer) {
                clearTimeout(this.cameraInactivityTimer);
                this.cameraInactivityTimer = null;
            }
            
            // Stop all video tracks to completely disable camera access
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('Camera track stopped for privacy');
            });
            
            // Clear the video source
            this.video.srcObject = null;
            this.stream = null;
            
            // Update UI
            this.video.classList.remove('active');
            document.getElementById('camera-placeholder').classList.remove('hidden');
            
            // Hide privacy indicator
            document.getElementById('privacy-indicator').classList.add('hidden');
            
            const startBtn = document.getElementById('start-camera');
            const captureBtn = document.getElementById('capture-photo');
            
            startBtn.textContent = 'START CAMERA';
            startBtn.classList.remove('btn-success');
            startBtn.disabled = false;
            captureBtn.disabled = true;
            
            this.showToast('Camera Stopped', 'Camera access has been completely disabled for your privacy.', 'success');
        }
    }

    startCameraInactivityTimer() {
        // Clear any existing timer
        if (this.cameraInactivityTimer) {
            clearTimeout(this.cameraInactivityTimer);
        }
        
        // Set timer for 5 minutes (300,000 ms)
        this.cameraInactivityTimer = setTimeout(() => {
            this.stopCamera();
            this.showToast('Camera Auto-Stopped', 'Camera was automatically disabled after 5 minutes of inactivity for privacy.', 'info');
        }, 300000);
    }

    resetCameraInactivityTimer() {
        if (this.stream && this.cameraInactivityTimer) {
            this.startCameraInactivityTimer();
        }
    }

    // Enhanced camera management with privacy features
    async startCamera() {
        console.log('🔍 Starting camera initialization...');
        
        const startBtn = document.getElementById('start-camera');
        const captureBtn = document.getElementById('capture-photo');
        const placeholder = document.getElementById('camera-placeholder');
        
        // Debug element availability
        console.log('Elements found:', {
            startBtn: !!startBtn,
            captureBtn: !!captureBtn,
            placeholder: !!placeholder,
            video: !!this.video
        });
        
        if (!startBtn || !captureBtn || !placeholder || !this.video) {
            console.error('❌ Missing required elements for camera initialization');
            this.showToast('Initialization Error', 'Missing page elements. Please refresh the page.', 'error');
            return;
        }
        
        this.showLoading('STARTING CAMERA...');
        startBtn.disabled = true;

        try {
            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }
            
            console.log('📱 Browser supports getUserMedia');
            
            // Get device-appropriate camera constraints
            const constraints = this.getCameraConstraints();
            console.log('🎥 Using camera constraints:', constraints);
            
            try {
                console.log('📞 Requesting camera access with ideal constraints...');
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('✅ Camera access granted with ideal constraints');
            } catch (constraintError) {
                console.warn('⚠️ Ideal constraints failed, trying fallback:', constraintError);
                // Fallback to basic constraints
                const fallbackConstraints = {
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                };
                console.log('🔄 Trying fallback constraints:', fallbackConstraints);
                this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                console.log('✅ Camera access granted with fallback constraints');
            }

            console.log('🎬 Setting video source...');
            this.video.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    console.log('📺 Video metadata loaded');
                    resolve();
                };
                this.video.onerror = (error) => {
                    console.error('❌ Video error:', error);
                    reject(error);
                };
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    reject(new Error('Video loading timeout'));
                }, 10000);
            });
            
            this.video.classList.add('active');
            placeholder.classList.add('hidden');
            
            // Log camera info for debugging
            const videoTrack = this.stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            console.log('📊 Camera Settings:', settings);
            console.log('🔧 Device Type:', this.deviceInfo);
            
            // Show privacy indicator
            const privacyIndicator = document.getElementById('privacy-indicator');
            if (privacyIndicator) {
                privacyIndicator.classList.remove('hidden');
            }
            
            startBtn.textContent = 'STOP CAMERA';
            startBtn.classList.add('btn-success');
            captureBtn.disabled = false;

            this.showToast('Camera Started', 'Camera is active. Click "STOP CAMERA" to disable for privacy.', 'success');
            
            // Start inactivity timer - auto-stop camera after 5 minutes of no interaction
            this.startCameraInactivityTimer();
            
            console.log('🎉 Camera initialization complete');
        } catch (error) {
            console.error('❌ Camera access error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                constraint: error.constraint
            });
            
            let errorMessage = 'Unable to access camera. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera permissions and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera is being used by another application.';
            } else {
                errorMessage += 'Please check permissions and try again.';
            }
            
            this.showToast('Camera Error', errorMessage, 'error');
            startBtn.disabled = false;
        } finally {
            this.hideLoading();
        }
    }

    selectFilter(button) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentFilter = button.dataset.filter;
        
        // Apply filter to video preview
        this.video.className = this.video.className.replace(/filter-\w+/g, '');
        if (this.currentFilter !== 'none') {
            this.video.classList.add(`filter-${this.currentFilter}`);
        }
        this.video.classList.add('active');
    }

    selectFrame(button) {
        // Remove active class from all frame buttons (both regular and custom)
        document.querySelectorAll('.frame-btn, .custom-frame-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentFrame = button.dataset.frame;
    }

    selectFrameColor(button) {
        // Remove active class from all color buttons
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentFrameColor = button.dataset.color;
    }

    toggleCameraMirror() {
        this.mirrorCamera = !this.mirrorCamera;
        const video = document.getElementById('video');
        const mirrorBtn = document.getElementById('mirror-toggle');
        
        if (this.mirrorCamera) {
            video.style.transform = 'scaleX(-1)';
            mirrorBtn.classList.add('active');
            mirrorBtn.textContent = '🪞 MIRROR ON';
        } else {
            video.style.transform = 'scaleX(1)';
            mirrorBtn.classList.remove('active');
            mirrorBtn.textContent = '🪞 MIRROR OFF';
        }
        
        this.showToast('Mirror Toggle', `Camera mirror ${this.mirrorCamera ? 'enabled' : 'disabled'}`, 'info');
    }

    clearPhotosOnPageLoad() {
        // Clear all stored photos for privacy on each page load/refresh
        try {
            localStorage.removeItem('photobooth-photos');
            console.log('Photos cleared for privacy on page load');
        } catch (error) {
            console.warn('Failed to clear photos:', error);
        }
        
        // Ensure empty state
        this.capturedPhotos = [];
        this.clearPhotoPreview();
        document.getElementById('download-photo').disabled = true;
    }

    clearPhotoPreview() {
        const previewContainer = document.getElementById('photo-preview');
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <div class="placeholder-icon">📷</div>
                <p>No photo taken yet</p>
            </div>
        `;
    }

    async capturePhoto() {
        if (!this.stream) {
            this.showToast('Camera Error', 'Camera is not active. Please start the camera first.', 'error');
            return;
        }

        // Check if this frame requires multiple shots
        if (this.currentFrame === 'strip' && !this.isCapturingMultiShot) {
            await this.captureMultiShot();
            return;
        }

        // Add camera flash animation
        this.showCameraFlash();
        
        // Add camera capture animation
        const cameraPreview = document.querySelector('.camera-preview');
        cameraPreview.classList.add('capturing');
        setTimeout(() => cameraPreview.classList.remove('capturing'), 600);

        this.showLoading('PROCESSING...');

        try {
            // Check if video is ready
            if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
                throw new Error('Video not ready - dimensions are zero');
            }

            // Set canvas size based on frame type
            this.setCanvasSizeForFrame();

            // Clear canvas first
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw the video frame to canvas with improved aspect ratio handling for all devices
            this.drawVideoToCanvas();

            // Apply filter
            this.applyFilter(this.currentFilter);

            // Apply frame
            await this.applyFrame(this.currentFrame);

            // Convert to data URL with error handling
            let dataURL;
            try {
                dataURL = this.canvas.toDataURL('image/png', 0.9);
                if (!dataURL || dataURL === 'data:,') {
                    throw new Error('Failed to generate image data');
                }
            } catch (canvasError) {
                console.error('Canvas toDataURL error:', canvasError);
                throw new Error('Failed to process image data');
            }

            // Store photo
            const photo = {
                data: dataURL,
                filter: this.currentFilter,
                frame: this.currentFrame,
                timestamp: Date.now()
            };

            this.capturedPhotos.unshift(photo);
            
            // Save to storage with error handling
            try {
                this.savePhotosToStorage();
            } catch (storageError) {
                console.warn('Storage save failed:', storageError);
                // Continue anyway - photo is still captured in memory
            }

            // Update photo preview
            this.updatePhotoPreview(photo);

            // Enable download button
            const downloadBtn = document.getElementById('download-photo');
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }

            this.showToast('Photo Captured!', 'Your photo is ready to download. Photos are cleared when page is refreshed for privacy.', 'success');
            
        } catch (error) {
            console.error('Photo capture error:', error);
            this.showToast('Capture Error', `Failed to capture photo: ${error.message}. Please try again.`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async captureMultiShot() {
        this.isCapturingMultiShot = true;
        this.multiShotPhotos = [];
        
        const captureBtn = document.getElementById('capture-photo');
        const originalText = captureBtn.textContent;
        
        try {
            for (let i = 0; i < 4; i++) {
                captureBtn.textContent = `📸 SHOT ${i + 1}/4`;
                captureBtn.disabled = true;
                
                // Show countdown for next shot (except first)
                if (i > 0) {
                    await this.showCountdown(3);
                }
                
                // Capture individual shot
                await this.captureSingleShot();
                
                // Wait a bit between shots
                if (i < 3) {
                    await this.delay(1000);
                }
            }
            
            // Create film strip composite
            await this.createFilmStripComposite();
            
        } catch (error) {
            console.error('Multi-shot capture error:', error);
            this.showToast('Capture Error', 'Failed to capture film strip. Please try again.', 'error');
        } finally {
            this.isCapturingMultiShot = false;
            captureBtn.textContent = originalText;
            captureBtn.disabled = false;
            this.hideLoading();
        }
    }

    drawVideoToCanvas() {
        // Device-aware video drawing with center cropping to exact frame aspect ratio
        const videoAspectRatio = this.video.videoWidth / this.video.videoHeight;
        const canvasAspectRatio = this.canvas.width / this.canvas.height;
        
        console.log('📐 Drawing video with precision center crop:', {
            videoSize: `${this.video.videoWidth}x${this.video.videoHeight}`,
            canvasSize: `${this.canvas.width}x${this.canvas.height}`,
            videoAspectRatio: videoAspectRatio.toFixed(3),
            canvasAspectRatio: canvasAspectRatio.toFixed(3),
            deviceType: this.deviceInfo
        });
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        let destX = 0, destY = 0;
        let destWidth = this.canvas.width, destHeight = this.canvas.height;
        
        // Special handling for polaroid - always crop to perfect square from center
        if (this.currentFrame === 'polaroid') {
            const minDimension = Math.min(this.video.videoWidth, this.video.videoHeight);
            sourceX = (this.video.videoWidth - minDimension) / 2;
            sourceY = (this.video.videoHeight - minDimension) / 2;
            sourceWidth = minDimension;
            sourceHeight = minDimension;
        } else {
            // For all other frames, crop to exact canvas aspect ratio from center
            if (videoAspectRatio > canvasAspectRatio) {
                // Video is wider than needed - crop sides to match canvas ratio exactly
                sourceHeight = this.video.videoHeight;
                sourceWidth = sourceHeight * canvasAspectRatio; // Exact aspect ratio match
                sourceX = (this.video.videoWidth - sourceWidth) / 2; // Center horizontally
                sourceY = 0;
            } else {
                // Video is taller than needed - crop top/bottom to match canvas ratio exactly
                sourceWidth = this.video.videoWidth;
                sourceHeight = sourceWidth / canvasAspectRatio; // Exact aspect ratio match
                sourceX = 0;
                sourceY = (this.video.videoHeight - sourceHeight) / 2; // Center vertically
            }
        }
        
        console.log('🎨 Precision crop dimensions:', { 
            source: `${sourceX.toFixed(1)}, ${sourceY.toFixed(1)}, ${sourceWidth.toFixed(1)}x${sourceHeight.toFixed(1)}`,
            dest: `${destX}, ${destY}, ${destWidth}x${destHeight}`,
            cropRatio: (sourceWidth / sourceHeight).toFixed(3)
        });
        
        // Draw with proper mirroring and precision center cropping
        this.ctx.save();
        if (this.mirrorCamera) {
            this.ctx.scale(-1, 1); // Flip horizontally to un-mirror
            this.ctx.drawImage(
                this.video,
                sourceX, sourceY, sourceWidth, sourceHeight, // Source crop area (exact ratio)
                -destWidth, destY, destWidth, destHeight // Destination (flipped)
            );
        } else {
            this.ctx.drawImage(
                this.video,
                sourceX, sourceY, sourceWidth, sourceHeight, // Source crop area (exact ratio)
                destX, destY, destWidth, destHeight // Destination
            );
        }
        this.ctx.restore();
    }

    async captureSingleShot() {
        return new Promise((resolve, reject) => {
            try {
                // Add camera flash animation
                this.showCameraFlash();
                
                // Check if video is ready
                if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
                    throw new Error('Video not ready');
                }

                // Create temporary canvas for this shot with proper aspect ratio
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                // Set canvas size based on desired output
                const videoAspectRatio = this.video.videoWidth / this.video.videoHeight;
                
                if (this.deviceInfo && this.deviceInfo.isMobile && videoAspectRatio < 1) {
                    // Mobile portrait - use portrait dimensions
                    tempCanvas.width = 480;
                    tempCanvas.height = 640;
                } else {
                    // Desktop/landscape - use landscape dimensions
                    tempCanvas.width = 640;
                    tempCanvas.height = 480;
                }

                // Use precision center cropping to match canvas aspect ratio exactly
                const canvasAspectRatio = tempCanvas.width / tempCanvas.height;
                let sourceX, sourceY, sourceWidth, sourceHeight;
                
                if (videoAspectRatio > canvasAspectRatio) {
                    // Video is wider - crop sides to exact canvas ratio
                    sourceHeight = this.video.videoHeight;
                    sourceWidth = sourceHeight * canvasAspectRatio; // Exact ratio match
                    sourceX = (this.video.videoWidth - sourceWidth) / 2; // Center crop
                    sourceY = 0;
                } else {
                    // Video is taller - crop top/bottom to exact canvas ratio
                    sourceWidth = this.video.videoWidth;
                    sourceHeight = sourceWidth / canvasAspectRatio; // Exact ratio match
                    sourceX = 0;
                    sourceY = (this.video.videoHeight - sourceHeight) / 2; // Center crop
                }

                console.log('📸 Single shot crop:', {
                    canvasSize: `${tempCanvas.width}x${tempCanvas.height}`,
                    sourceArea: `${sourceX.toFixed(1)}, ${sourceY.toFixed(1)}, ${sourceWidth.toFixed(1)}x${sourceHeight.toFixed(1)}`,
                    aspectRatio: (sourceWidth / sourceHeight).toFixed(3)
                });

                // Draw video frame with precision center cropping (un-mirror if camera is mirrored)
                tempCtx.save();
                if (this.mirrorCamera) {
                    tempCtx.scale(-1, 1); // Flip horizontally to un-mirror
                    tempCtx.drawImage(
                        this.video,
                        sourceX, sourceY, sourceWidth, sourceHeight, // Source crop (exact ratio)
                        -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height // Destination (flipped)
                    );
                } else {
                    tempCtx.drawImage(
                        this.video,
                        sourceX, sourceY, sourceWidth, sourceHeight, // Source crop (exact ratio)
                        0, 0, tempCanvas.width, tempCanvas.height // Destination
                    );
                }
                tempCtx.restore();

                // Apply filter to temp canvas
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                this.applyFilterToImageData(imageData, this.currentFilter);
                tempCtx.putImageData(imageData, 0, 0);

                // Store the shot
                const shotData = tempCanvas.toDataURL('image/png', 0.9);
                this.multiShotPhotos.push(shotData);
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    async showCountdown(seconds) {
        return new Promise((resolve) => {
            let count = seconds;
            const countdownInterval = setInterval(() => {
                this.showToast(`Get Ready!`, `Next shot in ${count}...`, 'info');
                count--;
                if (count < 0) {
                    clearInterval(countdownInterval);
                    resolve();
                }
            }, 1000);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showCameraFlash() {
        const flash = document.createElement('div');
        flash.className = 'camera-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 500);
    }

    setCanvasSizeForFrame() {
        const baseWidth = this.video.videoWidth;
        const baseHeight = this.video.videoHeight;
        const videoAspectRatio = baseWidth / baseHeight;
        
        console.log('📏 Setting canvas size for frame:', {
            frame: this.currentFrame,
            videoSize: `${baseWidth}x${baseHeight}`,
            aspectRatio: videoAspectRatio.toFixed(2),
            deviceType: this.deviceInfo
        });
        
        switch (this.currentFrame) {
            case 'strip':
                // This will be overridden by createFilmStripComposite for multi-shot
                // For single shot strip, use device-appropriate dimensions
                if (this.deviceInfo && this.deviceInfo.isMobile && videoAspectRatio < 1) {
                    // Mobile portrait - narrower strip
                    this.canvas.width = 360;
                    this.canvas.height = 1280;
                } else {
                    // Desktop/landscape - standard strip
                    this.canvas.width = 440;
                    this.canvas.height = 1320;
                }
                break;
                
            case 'collage':
                // Device-aware collage dimensions
                if (this.deviceInfo && this.deviceInfo.isMobile) {
                    // Mobile - smaller collage
                    this.canvas.width = 480;
                    this.canvas.height = 640;
                } else if (this.deviceInfo && this.deviceInfo.isTablet) {
                    // Tablet - medium collage
                    this.canvas.width = 540;
                    this.canvas.height = 720;
                } else {
                    // Desktop - full size collage
                    this.canvas.width = 600;
                    this.canvas.height = 800;
                }
                break;
                
            case 'polaroid':
                // Square format - device appropriate size
                let squareSize;
                if (this.deviceInfo && this.deviceInfo.isMobile) {
                    squareSize = 480;
                } else if (this.deviceInfo && this.deviceInfo.isTablet) {
                    squareSize = 540;
                } else {
                    squareSize = 600;
                }
                this.canvas.width = squareSize;
                this.canvas.height = squareSize;
                break;
                
            default:
                // Standard size - maintain aspect ratio but optimize for device
                if (this.deviceInfo && this.deviceInfo.isMobile && videoAspectRatio < 1) {
                    // Mobile portrait
                    this.canvas.width = Math.min(baseWidth, 480);
                    this.canvas.height = Math.min(baseHeight, 640);
                } else if (this.deviceInfo && this.deviceInfo.isTablet) {
                    // Tablet
                    this.canvas.width = Math.min(baseWidth, 720);
                    this.canvas.height = Math.min(baseHeight, 540);
                } else {
                    // Desktop
                    this.canvas.width = Math.min(baseWidth, 800);
                    this.canvas.height = Math.min(baseHeight, 600);
                }
                break;
        }
        
        console.log('📐 Canvas size set:', `${this.canvas.width}x${this.canvas.height}`);
    }

    updatePhotoPreview(photo) {
        const previewContainer = document.getElementById('photo-preview');
        previewContainer.innerHTML = `
            <img src="${photo.data}" alt="Latest photo" class="preview-image">
        `;
    }

    applyFilter(filter) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply filter using new filter system
        this.applyFilterToImageData(imageData, filter);

        this.ctx.putImageData(imageData, 0, 0);
    }

    applyFilterToImageData(imageData, filter) {
        const data = imageData.data;
        
        switch (filter) {
            case 'monomuse':
                // MonoMuse: grayscale(100%) contrast(120%)
                for (let i = 0; i < data.length; i += 4) {
                    // Convert to grayscale
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    // Apply contrast (120%)
                    const contrasted = ((gray - 128) * 1.2) + 128;
                    data[i] = Math.max(0, Math.min(255, contrasted));
                    data[i + 1] = Math.max(0, Math.min(255, contrasted));
                    data[i + 2] = Math.max(0, Math.min(255, contrasted));
                }
                break;
                
            case 'retrograde':
                // Retrograde: contrast(110%) sepia(40%) brightness(80%) saturate(70%)
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    
                    // Apply brightness (80%)
                    r *= 0.8;
                    g *= 0.8;
                    b *= 0.8;
                    
                    // Apply saturation (70%)
                    const gray = r * 0.299 + g * 0.587 + b * 0.114;
                    r = gray + (r - gray) * 0.7;
                    g = gray + (g - gray) * 0.7;
                    b = gray + (b - gray) * 0.7;
                    
                    // Apply sepia (40%)
                    const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
                    const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
                    const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);
                    
                    r = r * 0.6 + sepiaR * 0.4;
                    g = g * 0.6 + sepiaG * 0.4;
                    b = b * 0.6 + sepiaB * 0.4;
                    
                    // Apply contrast (110%)
                    r = ((r - 128) * 1.1) + 128;
                    g = ((g - 128) * 1.1) + 128;
                    b = ((b - 128) * 1.1) + 128;
                    
                    data[i] = Math.max(0, Math.min(255, r));
                    data[i + 1] = Math.max(0, Math.min(255, g));
                    data[i + 2] = Math.max(0, Math.min(255, b));
                }
                break;
                
            case 'vivapop':
                // VivaPop: saturate(150%) brightness(110%) contrast(105%)
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    
                    // Apply brightness (110%)
                    r *= 1.1;
                    g *= 1.1;
                    b *= 1.1;
                    
                    // Apply saturation (150%)
                    const gray = r * 0.299 + g * 0.587 + b * 0.114;
                    r = gray + (r - gray) * 1.5;
                    g = gray + (g - gray) * 1.5;
                    b = gray + (b - gray) * 1.5;
                    
                    // Apply contrast (105%)
                    r = ((r - 128) * 1.05) + 128;
                    g = ((g - 128) * 1.05) + 128;
                    b = ((b - 128) * 1.05) + 128;
                    
                    data[i] = Math.max(0, Math.min(255, r));
                    data[i + 1] = Math.max(0, Math.min(255, g));
                    data[i + 2] = Math.max(0, Math.min(255, b));
                }
                break;
                
            case 'solshine':
                // SolShine: saturate(140%) brightness(115%) contrast(110%) sepia(10%)
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    
                    // Apply brightness (115%)
                    r *= 1.15;
                    g *= 1.15;
                    b *= 1.15;
                    
                    // Apply saturation (140%)
                    const gray = r * 0.299 + g * 0.587 + b * 0.114;
                    r = gray + (r - gray) * 1.4;
                    g = gray + (g - gray) * 1.4;
                    b = gray + (b - gray) * 1.4;
                    
                    // Apply slight sepia (10%)
                    const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
                    const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
                    const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);
                    
                    r = r * 0.9 + sepiaR * 0.1;
                    g = g * 0.9 + sepiaG * 0.1;
                    b = b * 0.9 + sepiaB * 0.1;
                    
                    // Apply contrast (110%)
                    r = ((r - 128) * 1.1) + 128;
                    g = ((g - 128) * 1.1) + 128;
                    b = ((b - 128) * 1.1) + 128;
                    
                    data[i] = Math.max(0, Math.min(255, r));
                    data[i + 1] = Math.max(0, Math.min(255, g));
                    data[i + 2] = Math.max(0, Math.min(255, b));
                }
                break;
                
            case 'none':
            default:
                // No filter applied - leave image data unchanged
                break;
        }
    }

    async createFilmStripComposite() {
        if (this.multiShotPhotos.length !== 4) {
            throw new Error('Need exactly 4 shots for film strip');
        }

        this.showLoading('CREATING FILM STRIP...');

        // Device-aware film strip dimensions
        let stripWidth, stripHeight;
        if (this.deviceInfo && this.deviceInfo.isMobile) {
            // Mobile - narrower strip for portrait orientation
            stripWidth = 360;
            stripHeight = 1280;
        } else if (this.deviceInfo && this.deviceInfo.isTablet) {
            // Tablet - medium strip
            stripWidth = 400;
            stripHeight = 1300;
        } else {
            // Desktop - full width strip
            stripWidth = 440;
            stripHeight = 1320;
        }

        // Set canvas to film strip dimensions
        this.canvas.width = stripWidth;
        this.canvas.height = stripHeight;

        // Create film strip background (using selected color or default dark)
        this.ctx.fillStyle = this.currentFrameColor === '#ffffff' ? '#2a2a2a' : this.currentFrameColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add film strip perforations on sides
        this.addFilmPerforations();

        // Load all shot images
        const shotImages = await Promise.all(
            this.multiShotPhotos.map(shotData => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = shotData;
                });
            })
        );

        // Calculate photo dimensions with proper spacing (device-aware)
        const totalPhotoArea = this.canvas.height * 0.7; // 70% for photos, 30% for spacing/borders
        const photoHeight = totalPhotoArea / 4;
        const photoWidth = this.canvas.width * 0.75; // 75% width for photos
        const photoX = (this.canvas.width - photoWidth) / 2;
        const spacingY = (this.canvas.height - totalPhotoArea) / 5; // Space between photos and at ends

        console.log('🎞️ Film strip dimensions:', {
            stripSize: `${stripWidth}x${stripHeight}`,
            photoSize: `${photoWidth}x${photoHeight}`,
            deviceType: this.deviceInfo
        });

        // Draw each photo with white border (like real photo booth strips)
        shotImages.forEach((img, index) => {
            const y = spacingY + (index * (photoHeight + spacingY));
            
            // Draw white photo border (like real instant photos)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(photoX - 6, y - 6, photoWidth + 12, photoHeight + 12);
            
            // Add slight shadow behind photo
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillRect(photoX - 4, y - 4, photoWidth + 8, photoHeight + 8);
            
            // Use precision center cropping to match photo frame ratio exactly
            const imgAspectRatio = img.width / img.height;
            const frameAspectRatio = photoWidth / photoHeight;
            
            let sourceX, sourceY, sourceWidth, sourceHeight;
            
            if (imgAspectRatio > frameAspectRatio) {
                // Image is wider than frame - crop sides to exact frame ratio
                sourceHeight = img.height;
                sourceWidth = sourceHeight * frameAspectRatio; // Exact frame ratio match
                sourceX = (img.width - sourceWidth) / 2; // Center horizontally
                sourceY = 0;
            } else {
                // Image is taller than frame - crop top/bottom to exact frame ratio
                sourceWidth = img.width;
                sourceHeight = sourceWidth / frameAspectRatio; // Exact frame ratio match
                sourceX = 0;
                sourceY = (img.height - sourceHeight) / 2; // Center vertically
            }
            
            console.log(`🎞️ Film strip photo ${index + 1} crop:`, {
                frameSize: `${photoWidth.toFixed(1)}x${photoHeight.toFixed(1)}`,
                sourceArea: `${sourceX.toFixed(1)}, ${sourceY.toFixed(1)}, ${sourceWidth.toFixed(1)}x${sourceHeight.toFixed(1)}`,
                cropRatio: (sourceWidth / sourceHeight).toFixed(3),
                frameRatio: frameAspectRatio.toFixed(3)
            });
            
            // Draw the photo with precision center cropping (fills frame exactly)
            this.ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight, // Source crop area (exact frame ratio)
                photoX, y, photoWidth, photoHeight // Destination frame
            );
        });

        // Add film strip branding at bottom
        this.addFilmStripBranding();

        // Store the film strip photo
        const dataURL = this.canvas.toDataURL('image/png', 0.9);
        const photo = {
            data: dataURL,
            filter: this.currentFilter,
            frame: this.currentFrame,
            timestamp: Date.now(),
            multiShot: true
        };

        this.capturedPhotos.unshift(photo);
        this.savePhotosToStorage();
        this.updatePhotoPreview(photo);

        // Enable download button
        const downloadBtn = document.getElementById('download-photo');
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }

        this.showToast('Film Strip Created!', 'Your authentic 4-shot film strip is ready! Photos clear on page refresh for privacy.', 'success');
    }

    addFilmPerforations() {
        // Add realistic film perforations on both sides
        const perfSize = 8;
        const perfSpacing = 16;
        const perfsPerSide = Math.floor(this.canvas.height / perfSpacing);
        
        this.ctx.fillStyle = '#000000';
        
        for (let i = 0; i < perfsPerSide; i++) {
            const y = i * perfSpacing + perfSpacing/2;
            
            // Left side perforations
            this.ctx.fillRect(8, y - perfSize/2, perfSize, perfSize);
            
            // Right side perforations
            this.ctx.fillRect(this.canvas.width - 16, y - perfSize/2, perfSize, perfSize);
        }
    }

    addFilmStripBranding() {
        // Add small branding text at bottom like real photo booth strips
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px "Courier Prime", monospace';
        this.ctx.textAlign = 'center';
        
        const brandingY = this.canvas.height - 40;
        this.ctx.fillText('PHOTOBOOTH', this.canvas.width / 2, brandingY);
        
        // Add small date/time
        this.ctx.font = '10px "Courier Prime", monospace';
        const date = new Date().toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: '2-digit' 
        });
        this.ctx.fillText(date, this.canvas.width / 2, brandingY + 15);
    }

    async applyFrame(frame) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Check if it's a custom frame
        if (frame.startsWith('custom-')) {
            const frameId = frame.replace('custom-', '');
            await this.applyCustomFrame(frameId, width, height);
            return;
        }
        
        switch (frame) {
            case 'polaroid':
                this.applyPolaroidFrame(width, height);
                break;
                
            case 'strip':
                // Strip frame is handled by multi-shot capture
                // This case is for when strip is selected but single shot is taken
                this.applyStripFrame(width, height);
                break;
                
            case 'collage':
                this.applyCollageFrame(width, height);
                break;
                
            default:
                // No frame applied for other cases
                break;
        }
    }

    applyPolaroidFrame(width, height) {
        // Add white border with bottom text area
        const borderSize = 40;
        const bottomBorder = 120;
        
        // Create temporary canvas with current image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Resize main canvas
        this.canvas.width = width + (borderSize * 2);
        this.canvas.height = height + borderSize + bottomBorder;
        
        // Fill with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
        
        // Draw the image with border
        this.ctx.drawImage(tempCanvas, borderSize, borderSize);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    applyStripFrame(width, height) {
        // This method is called when not using multi-shot
        // Create a single photo strip effect
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Set strip dimensions (2:6 aspect ratio)
        this.canvas.width = 400;
        this.canvas.height = 1200;
        
        const stripHeight = this.canvas.height / 4;
        const stripWidth = this.canvas.width - 20;
        
        // Fill background
        this.ctx.fillStyle = '#f5f1e8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw 4 copies of the same image
        for (let i = 0; i < 4; i++) {
            const y = 10 + (i * (stripHeight - 5));
            const x = 10;
            
            // Add white border
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x - 2, y - 2, stripWidth + 4, stripHeight - 6);
            
            this.ctx.drawImage(tempCanvas, x, y, stripWidth, stripHeight - 10);
        }
    }

    applyCollageFrame(width, height) {
        // For collage, we should ideally capture 4 separate shots too
        // But for now, we'll use the single image in 4 positions with slight variations
        
        // Create temporary canvas with current image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Set 3:4 aspect ratio for collage
        this.canvas.width = 600;
        this.canvas.height = 800;
        
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        const gap = 15;
        const photoWidth = halfWidth - gap;
        const photoHeight = halfHeight - gap;
        
        // Fill background with selected color
        this.ctx.fillStyle = this.currentFrameColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add decorative border
        this.ctx.strokeStyle = '#d4c4a8';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);
        
        // Draw 4 copies in grid with slight variations
        const positions = [
            { x: gap/2, y: gap/2 }, // Top left
            { x: halfWidth + gap/2, y: gap/2 }, // Top right
            { x: gap/2, y: halfHeight + gap/2 }, // Bottom left
            { x: halfWidth + gap/2, y: halfHeight + gap/2 } // Bottom right
        ];
        
        positions.forEach((pos, index) => {
            // Add white photo border
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(pos.x - 5, pos.y - 5, photoWidth + 10, photoHeight + 10);
            
            // Add subtle shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
            this.ctx.fillRect(pos.x + 2, pos.y + 2, photoWidth + 5, photoHeight + 5);
            
            // Use precision center cropping to match photo slot ratio exactly
            const tempAspectRatio = tempCanvas.width / tempCanvas.height;
            const photoAspectRatio = photoWidth / photoHeight;
            
            let sourceX, sourceY, sourceWidth, sourceHeight;
            
            if (tempAspectRatio > photoAspectRatio) {
                // Image is wider than photo slot - crop sides to exact slot ratio
                sourceHeight = tempCanvas.height;
                sourceWidth = sourceHeight * photoAspectRatio; // Exact slot ratio match
                sourceX = (tempCanvas.width - sourceWidth) / 2; // Center horizontally
                sourceY = 0;
            } else {
                // Image is taller than photo slot - crop top/bottom to exact slot ratio
                sourceWidth = tempCanvas.width;
                sourceHeight = sourceWidth / photoAspectRatio; // Exact slot ratio match
                sourceX = 0;
                sourceY = (tempCanvas.height - sourceHeight) / 2; // Center vertically
            }
            
            console.log(`🖼️ Collage photo ${index + 1} crop:`, {
                slotSize: `${photoWidth.toFixed(1)}x${photoHeight.toFixed(1)}`,
                sourceArea: `${sourceX.toFixed(1)}, ${sourceY.toFixed(1)}, ${sourceWidth.toFixed(1)}x${sourceHeight.toFixed(1)}`,
                cropRatio: (sourceWidth / sourceHeight).toFixed(3),
                slotRatio: photoAspectRatio.toFixed(3)
            });
            
            // Draw the photo with precision center cropping and slight rotation for variety
            this.ctx.save();
            this.ctx.translate(pos.x + photoWidth/2, pos.y + photoHeight/2);
            const rotation = (index - 1.5) * 0.02; // Slight rotation variation
            this.ctx.rotate(rotation);
            this.ctx.drawImage(
                tempCanvas,
                sourceX, sourceY, sourceWidth, sourceHeight, // Source crop (exact slot ratio)
                -photoWidth/2, -photoHeight/2, photoWidth, photoHeight // Destination
            );
            this.ctx.restore();
        });
    }

    async applyCustomFrame(frameId, width, height) {
        const customFrame = this.customFrames.find(frame => frame.id === frameId);
        if (!customFrame) return;
        
        try {
            // Create temporary canvas with current image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.canvas, 0, 0);
            
            // Load the frame image
            const frameImg = new Image();
            await new Promise((resolve, reject) => {
                frameImg.onload = resolve;
                frameImg.onerror = reject;
                frameImg.src = customFrame.imagePath;
            });
            
            // Resize canvas to match frame dimensions or maintain aspect ratio
            const frameAspectRatio = frameImg.width / frameImg.height;
            const photoAspectRatio = width / height;
            
            let newCanvasWidth, newCanvasHeight;
            
            if (frameAspectRatio > photoAspectRatio) {
                // Frame is wider - match frame width
                newCanvasWidth = frameImg.width;
                newCanvasHeight = frameImg.height;
            } else {
                // Frame is taller or same ratio - match frame height
                newCanvasWidth = frameImg.width;
                newCanvasHeight = frameImg.height;
            }
            
            // Resize the main canvas
            this.canvas.width = newCanvasWidth;
            this.canvas.height = newCanvasHeight;
            
            // Clear the canvas
            this.ctx.clearRect(0, 0, newCanvasWidth, newCanvasHeight);
            
            // Calculate how to fit the photo in the frame
            // Assume the frame has a transparent center where the photo should go
            // For now, we'll center the photo and then overlay the frame
            
            const photoScale = Math.min(newCanvasWidth / width, newCanvasHeight / height) * 0.8; // 0.8 to leave room for frame
            const scaledPhotoWidth = width * photoScale;
            const scaledPhotoHeight = height * photoScale;
            const photoX = (newCanvasWidth - scaledPhotoWidth) / 2;
            const photoY = (newCanvasHeight - scaledPhotoHeight) / 2;
            
            // Draw the photo first
            this.ctx.drawImage(tempCanvas, photoX, photoY, scaledPhotoWidth, scaledPhotoHeight);
            
            // Draw the frame overlay
            this.ctx.drawImage(frameImg, 0, 0, newCanvasWidth, newCanvasHeight);
            
        } catch (error) {
            console.error('Error applying custom frame:', error);
            this.showToast('Frame Error', 'Failed to apply custom frame.', 'error');
        }
    }
    
    downloadLatestPhoto() {
        if (this.capturedPhotos.length === 0) {
            this.showToast('No Photos', 'No photos available to download. Please capture a photo first.', 'error');
            return;
        }

        try {
            const photo = this.capturedPhotos[0];
            
            // Validate photo data
            if (!photo.data || !photo.data.startsWith('data:image/')) {
                throw new Error('Invalid photo data');
            }
            
            const link = document.createElement('a');
            const timestamp = new Date(photo.timestamp).toISOString().replace(/[:.]/g, '-');
            link.download = `photobooth-${timestamp}.png`;
            link.href = photo.data;
            
            // Add to DOM temporarily
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);

            this.showToast('Photo Downloaded!', 'Your photo has been saved to your device.', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Download Error', `Failed to download photo: ${error.message}. Please try again.`, 'error');
        }
    }

    updateGallery() {
        // Gallery functionality removed - photos are stored and can be downloaded
        // This method is kept for compatibility but does nothing
    }

    savePhotosToStorage() {
        // Note: Photos are now session-only for privacy
        // They will be cleared on page reload/refresh
        // This method is kept for potential temporary storage during the session
        try {
            if (typeof(Storage) !== "undefined") {
                // Only keep photos in memory, don't persist to localStorage
                console.log('Photos stored in session memory only (will clear on page reload)');
            }
        } catch (error) {
            console.warn('Storage operation failed:', error);
        }
    }

    showLoading(text) {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = text;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hidden');
    }

    showToast(title, message, type = 'success') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // Cleanup method
    destroy() {
        // Clear inactivity timer
        if (this.cameraInactivityTimer) {
            clearTimeout(this.cameraInactivityTimer);
            this.cameraInactivityTimer = null;
        }
        
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.photoboothApp = new PhotoboothApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.photoboothApp) {
        window.photoboothApp.destroy();
    }
});