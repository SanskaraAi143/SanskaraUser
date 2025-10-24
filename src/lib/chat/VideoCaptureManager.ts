
class VideoCaptureManager {
  constructor() {
    this.videoStream = null;
    this.currentMode = null; // 'camera' or 'screen'
    this.isCapturing = false;
    this.captureInterval = null;
    this.onFrameCaptured = null;
    this.frameQuality = 0.8; // JPEG quality
    this.frameInterval = 1000; // 1 frame per second
    this.canvas = document.createElement('canvas');
    this.canvasContext = this.canvas.getContext('2d');
  }

  async checkPermission(deviceType) {
    try {
      let permissionName;
      let constraints;

      if (deviceType === 'screen') {
        return true; // Screen sharing permissions checked during request
      } else {
        permissionName = 'camera';
        constraints = { video: true };
      }

      const result = await navigator.permissions.query({ name: permissionName });
      if (result.state === 'granted') {
        return true;
      } else {
        // Test by actually requesting
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  async startCameraCapture(deviceId = null) {
    if (this.isCapturing) return;

    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentMode = 'camera';
      this.isCapturing = true;

      this.startFrameCapture();
      return true;

    } catch (error) {
      console.error('Camera capture failed:', error);

      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found. Please connect a camera.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera is already in use by another application.');
      } else {
        throw new Error(`Camera capture failed: ${error.message}`);
      }
    }
  }

  async startScreenCapture() {
    if (this.isCapturing) return;

    try {
      this.videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 5 } // Lower framerate for screen sharing
        }
      });

      this.currentMode = 'screen';
      this.isCapturing = true;

      this.startFrameCapture();
      return true;

    } catch (error) {
      console.error('Screen capture failed:', error);

      if (error.name === 'NotAllowedError') {
        throw new Error('Screen sharing permission denied. Please allow screen sharing.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('Screen sharing not available in this browser.');
      } else {
        throw new Error(`Screen capture failed: ${error.message}`);
      }
    }
  }

  startFrameCapture() {
    this.captureInterval = setInterval(async () => {
      await this.captureFrame();
    }, this.frameInterval);
  }

  async captureFrame() {
    if (!this.videoStream || !this.isCapturing) return;

    return new Promise((resolve) => {
      const videoTrack = this.videoStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      // Set up canvas to match video dimensions
      this.canvas.width = settings.width;
      this.canvas.height = settings.height;

      // Create an image bitmap from the video
      const imageCapture = new ImageCapture(videoTrack);

      imageCapture.grabFrame().then(imageBitmap => {
        this.canvasContext.drawImage(imageBitmap, 0, 0);

        this.canvas.toBlob(async (blob) => {
          if (blob && this.onFrameCaptured) {
            const base64Data = await this.blobToBase64(blob);

            this.onFrameCaptured({
              data: base64Data,
              mode: this.currentMode,
              mimeType: 'image/jpeg'
            });
          }
          resolve();
        }, 'image/jpeg', this.frameQuality);
      }).catch(error => {
        console.error('Frame capture failed:', error);
        resolve();
      });
    });
  }

  stopCapture() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    this.isCapturing = false;
    this.currentMode = null;
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getActiveDevices() {
    return navigator.mediaDevices.enumerateDevices();
  }

  getCaptureState() {
    return {
      isCapturing: this.isCapturing,
      mode: this.currentMode,
      hasStream: !!this.videoStream
    };
  }
}

export default VideoCaptureManager;
