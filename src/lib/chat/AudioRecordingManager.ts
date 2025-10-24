
class AudioRecordingManager {
  constructor() {
    this.mediaRecorder = null;
    this.audioStream = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.onDataAvailable = null;
    this.onRecordingStop = null;
    this.preferredSampleRate = 16000; // 16kHz for better quality
  }

  async checkPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      return result.state === 'granted';
    } catch (e) {
      // Fallback for browsers without permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  async startRecording() {
    if (this.isRecording) return;

    try {
      const constraints = {
        audio: {
          sampleRate: this.preferredSampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Configure MediaRecorder for PCM data
      const options = {
        mimeType: 'audio/webm;codecs=pcm',
        audioBitsPerSecond: 128000
      };

      // Fallback for browsers that don't support PCM
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }

      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          if (this.onDataAvailable) {
            this.onDataAvailable(event.data);
          }
        }
      };

      this.mediaRecorder.onstop = async () => {
        if (this.recordedChunks.length > 0) {
          const audioBlob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder.mimeType
          });

          const base64Data = await this.blobToBase64(audioBlob);

          if (this.onRecordingStop) {
            this.onRecordingStop(base64Data);
          }
        }

        this.cleanup();
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      return true;

    } catch (error) {
      console.error('Audio recording failed:', error);
      this.cleanup();

      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone.');
      } else {
        throw new Error(`Audio recording failed: ${error.message}`);
      }
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      return true;
    }
    return false;
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

  cleanup() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  getRecordingState() {
    return this.isRecording;
  }
}

export default AudioRecordingManager;
