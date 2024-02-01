import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: "fe7b2e07912d4a3188025ac0fd954d3b"
})

function ChatMessage(props) {
  const selectedPreference = props.selectedPreference;
  const { text, uid, photoURL, audioURL, imageURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const [transcription, setTranscription] = useState(null);

  const textToSpeech = (text) => {
    console.log("text to speech called");
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const params = {
    audio: audioURL,
  };

  const speechToText = async () => {
    try {
      const transcript = await client.transcripts.transcribe(params);
      setTranscription(transcript.text);
    } catch (error) {
      console.log('Error converting audio to text:', error);
    }
  };


  useEffect(() => {
    speechToText();
    return () => {
      setTranscription(null);
    };
  }, [selectedPreference, audioURL]);

  return (
    <div className={`message ${messageClass} flex gap-x-3 items-center py-3`}>
      <img className="rounded-full w-8 h-8" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="user" />
      {selectedPreference === 'Blindness' ? (
        <div>
          {text && <button onClick={() => textToSpeech(text)}>Speak</button>}
        </div>
      ) : (
        !audioURL && <p className={(messageClass == 'sent'? "bg-blue-600": "bg-slate-600")+(text && " px-4 py-2")+" rounded-3xl"}>{text}</p>
      )}
      {selectedPreference === 'Deafness' && audioURL ? <p className="bg-slate-50 px-4 py-2 rounded-3xl">{transcription}</p> : audioURL && <audio controls src={audioURL}></audio>}
      {imageURL && selectedPreference == "Color-Blindness" && <img src={imageURL} className={`rounded-xl ${selectedPreference}`} alt="image" style={{ width: '300px', aspectRatio: '[3/2]' }} />}
      {imageURL && !(selectedPreference === "Color-Blindness") && <img src={imageURL} className="rounded-xl" alt="image" style={{ width: '300px', aspectRatio: '[3/2]' }} />}
    </div>
  );
}

export default ChatMessage;