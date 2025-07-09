import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Mic, StopCircle, Play, Pause, X } from 'lucide-react';

interface AudioInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioRecorded: (audioBlob: Blob, text: string) => void;
}

const AudioInputModal: React.FC<AudioInputModalProps> = ({ isOpen, onClose, onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setIsRecording(false);
      setAudioBlob(null);
      setAudioURL(null);
      setTranscribedText('');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        // TODO: Send blob to STT API and set transcribedText
        setTranscribedText('Transcription of your audio will appear here...'); // Placeholder
        stream.getTracks().forEach(track => track.stop()); // Stop microphone
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure it is connected and permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleSend = () => {
    if (audioBlob && transcribedText) {
      onAudioRecorded(audioBlob, transcribedText);
      onClose();
    } else {
      alert('Please record audio and wait for transcription before sending.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#8d6e63]">Voice Input</DialogTitle>
          <DialogDescription className="text-gray-600">
            Record your message for Sanskara AI.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {!isRecording && !audioURL && (
            <Button
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-gradient-to-r from-[#ff8f00] to-[#ffc107] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Mic size={48} />
            </Button>
          )}
          {isRecording && (
            <Button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-pulse hover:scale-105 transition-transform"
            >
              <StopCircle size={48} />
            </Button>
          )}
          {audioURL && (
            <div className="flex items-center gap-4">
              <audio ref={audioRef} src={audioURL} controls={false} />
              <Button onClick={playAudio} className="bg-green-500 text-white rounded-full p-3">
                <Play size={24} />
              </Button>
              <Button onClick={pauseAudio} className="bg-yellow-500 text-white rounded-full p-3">
                <Pause size={24} />
              </Button>
            </div>
          )}
          <p className="text-sm text-gray-500">
            {isRecording ? 'Recording...' : audioURL ? 'Ready to send' : 'Click mic to start recording'}
          </p>
          {transcribedText && (
            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm mt-4">
              <p className="font-semibold mb-1">Transcribed Text:</p>
              <p>{transcribedText}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={onClose} className="text-gray-600 border-gray-300 hover:bg-gray-100">
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSend} className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white">
            Send Audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AudioInputModal;
