import React, { useRef, useState } from 'react';
import { auth, firestore, storage, firebase } from '../firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { ReactMic } from 'react-mic';
import ChatMessage from './ChatMessage';

function ChatRoom(props) {
  const selectedPreference = props.selectedPreference;
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [record, setRecord] = useState(false);
  const [blob, setBlob] = useState(null);
  const [image, setImage] = useState(null);

  const onRecordingComplete = (blobObject) => {
    setBlob(blobObject.blob);
  };

  const renderAudio = () => {
    if (blob) {
      const audioUrl = URL.createObjectURL(blob);
      return (
        <div>
          <audio controls>
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
    return null;
  };

  const renderImage = () => {
    if (image) {
      const imageUrl = URL.createObjectURL(image);
      console.log('Image URL:', imageUrl);

      return (
        <div>
          <img src={imageUrl} alt="image" style={{ height: '200px', width: '300px', borderRadius: '0' }} />
        </div>
      );
    }
    return null;
  };

  const sendVoiceMessage = async () => {
    console.log("voice uplaod called");
    const { uid, photoURL } = auth.currentUser;

    // Upload audio file to Firebase Storage
    const storageRef = storage.ref();
    const audioRef = storageRef.child(`${uid}/${new Date().toISOString()}.wav`);
    await audioRef.put(blob);

    // Get the URL of the uploaded audio
    const audioURL = await audioRef.getDownloadURL();

    // Add voice message to Firestore
    await messagesRef.add({
      audioURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setBlob(null);
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleImageUpload = async () => {
    const { uid, photoURL } = auth.currentUser;

    // Upload image to Firebase Storage
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`${uid}/${new Date().toISOString()}.jpg`);
    await imageRef.put(image);

    // Get the URL of the uploaded image
    const imageURL = await imageRef.getDownloadURL();

    // Add image message to Firestore
    await messagesRef.add({
      imageURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setImage(null);
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    // Send text message
    if (formValue.trim() !== '') {
      const { uid, photoURL } = auth.currentUser;
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Send voice message if there is a recorded audio
    if (blob) {
      await sendVoiceMessage();
    }
    if (image) {
      await handleImageUpload();
    }
  };

  const startRecord = <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z"
      stroke="#ffffff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>;

  const stopRecord = <svg
    width="800px"
    height="800px"
    viewBox="-5 0 32 32"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      id="Page-1"
      stroke="none"
      strokeWidth={1}
      fill="none"
      fillRule="evenodd"
    >
      <g
        id="Icon-Set-Filled"
        transform="translate(-107.000000, -309.000000)"
        fill="#ffffff"
        stroke="#ffffff"
      >
        <path
          d="M118,333 C121.866,333 125,329.866 125,326 L125,316 C125,312.134 121.866,309 118,309 C114.134,309 111,312.134 111,316 L111,326 C111,329.866 114.134,333 118,333 L118,333 Z M129,328 L127,328 C126.089,332.007 122.282,335 118,335 C113.718,335 109.911,332.007 109,328 L107,328 C107.883,332.799 112.063,336.51 117,336.955 L117,339 L116,339 C115.448,339 115,339.448 115,340 C115,340.553 115.448,341 116,341 L120,341 C120.552,341 121,340.553 121,340 C121,339.448 120.552,339 120,339 L119,339 L119,336.955 C123.937,336.51 128.117,332.799 129,328 L129,328 Z"
          id="microphone"
        ></path>
      </g>
    </g>
  </svg>;

  return (
    <>
      <main id="chat-box-screen" className="overflow-y-scroll chat-box-screen flex flex-col py-3 px-8 gap-y-5 bg-gray-900">
        <div  className='flex min-h-full flex-col'>
          {messages && messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} selectedPreference={selectedPreference} />
          ))}
          {renderAudio()}
          {renderImage()}
          <span ref={dummy}></span>
        </div>
      </main>

      <form onSubmit={sendMessage} className="form fixed right-0 left-0 bottom-0 h-15 flex items-center justify-evenly px-5 bg-gray-900 text-slate-50">

        
        <input
          type="text" id="first_name"
          className="bg-gray-50 h-11 border border-gray-300 text-slate-50 outline-slate-900 text-sm rounded-3xl focus:ring-blue-500 focus:border-blue-500 block w-4/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
          placeholder="Message"
          onChange={(e) => setFormValue(e.target.value)}
          value={formValue}
        />
        <ReactMic
          record={record}
          onStop={onRecordingComplete}
          strokeColor="#000000"
          backgroundColor="#e37034"
        />

        <button type="button" onClick={() => setRecord(!record)} className="relative size-11 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
          <span className={`relative flex p-1.5 items-center gap-x-3 transition-all ease-in duration-100 text-white ${record ? "bg-transparent" : "bg-gray-900"} dark:bg-gray-900 rounded-full size-10`}>{record ? stopRecord : startRecord}</span>
        </button>

        <input type='file' accept="image/*" onChange={handleImageChange} />

        <button type="submit" onClick={() => {
          const scrollable = document.querySelector('#chat-box-screen');
          scrollable.scrollTop = scrollable.scrollHeight;
        }} disabled={!formValue && !blob && !image}>
          Send
        </button>
      </form>
    </>
  );
}

export default ChatRoom;