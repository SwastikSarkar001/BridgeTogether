import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import '../styles/App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; // Add storage import
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { ReactMic } from 'react-mic';
import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: "fe7b2e07912d4a3188025ac0fd954d3b"
})

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_API_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App bg-gray-900">
      <Router>
        <Navbar />
        <main className="text-slate-50 text-lg" style={{ whiteSpace: "pre-wrap" }}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/about" element={<About />} />
            {user && <Route exact path="/chat" element={<ChatRoom />} />}
            <Route exact path="/contact-us" element={<ContactUs />} />
            <Route path="*" element={<Navigate to='/' />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

function Navbar() {
  const [user] = useAuthState(auth);

  const [selectedPreference, setSelectedPreference] = useState('');

  const handlePreferenceChange = (event) => {
    const newPreference = event.target.value;
    setSelectedPreference(newPreference);

    // Store the selected preference in local storage
    localStorage.removeItem('userPreference');
    localStorage.setItem('userPreference', newPreference);
  };

  useEffect(() => {
    const preference = localStorage.getItem("userPreference");
    setSelectedPreference(preference);
    console.log(preference);
  }, []);

  const location = useLocation();
  const activeClass = "block py-2 px-3 md:p-0 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500";
  const inactiveClass = "block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700";
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://i.ibb.co/kGFrNZP/Bridge-Together.png" alt="BridgeTogether Logo" className="rounded-full h-10" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">BridgeTogether</span>
        </a>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">

          {user &&
            <div onClick={(e) => e.stopPropagation()} className="mr-4">
              <select
                id="preferences"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={selectedPreference}
                onChange={handlePreferenceChange}
              >
                <option selected value='Normal'>None</option>
                <option value='Deafness'>Deafness</option>
                <option value='Color-Blindness'>Color-Blindness</option>
                <option value='Blindness'>Blindness</option>
              </select>
            </div>
          }

          {user ? <SignOut /> : <SignIn />}

          <button data-collapse-toggle="navbar-cta" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link to="/" className={location.pathname === '/' ? activeClass : inactiveClass} id='Home'>Home</Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? activeClass : inactiveClass} id='About'>About</Link>
            </li>
            {user && <li><Link to="/chat" className={location.pathname === '/chat' ? activeClass : inactiveClass} id='Chat'>Chat</Link></li>}
            <li>
              <Link to="/contact-us" className={location.pathname === '/contact-us' ? activeClass : inactiveClass} id='Contact'>Contact Us</Link>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800" onClick={signInWithGoogle}>
        <span className="relative flex items-center gap-x-3 px-5 py-2.5 transition-all ease-in duration-100 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          <svg
            width="18px"
            height="18px"
            viewBox="-0.5 0 48 48"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <title>Google-color</title>
            <desc>Created with Sketch.</desc>
            <defs></defs>
            <g id="Icons" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
              <g id="Color-" transform="translate(-401.000000, -860.000000)">
                <g id="Google" transform="translate(401.000000, 860.000000)">
                  <path
                    d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                    id="Fill-1"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                    id="Fill-2"
                    fill="#EB4335"
                  ></path>
                  <path
                    d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                    id="Fill-3"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                    id="Fill-4"
                    fill="#4285F4"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
          Sign In with Google
        </span>
      </button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800" onClick={() => auth.signOut()}>
      <span className="relative flex items-center gap-x-3 px-5 py-2.5 transition-all ease-in duration-100 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
        <svg fill="#ffffff" viewBox="0 0 24 24" id="sign-out-left-2" xmlns="http://www.w3.org/2000/svg" className="icon flat-line" stroke="#ffffff" style={{ aspectRatio: "1/1", width: "20px" }}>
          <g id="SVGRepo_bgCarrier" strokeWidth="0" />
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
          <g id="SVGRepo_iconCarrier">
            <polyline id="primary" points="6 15 3 12 6 9" style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }} />
            <line id="primary-2" x1="3" y1="12" x2="17" y2="12" style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }} />
            <path id="primary-3" d="M10,8V5a1,1,0,0,1,1-1h9a1,1,0,0,1,1,1V19a1,1,0,0,1-1,1H11a1,1,0,0,1-1-1V16" style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }} />
          </g>
        </svg>
        Sign Out
      </span>
    </button>
  )
}

function Home() {
  return (
    <>
      Introducing "UnitySpeak" - Bridging Conversations, Breaking Barriers <br /><br />

      Welcome to UnitySpeak, where communication knows no bounds. In a world that thrives on connections, we recognize the importance of inclusive communication. Our revolutionary app is designed to break down barriers and foster seamless conversations between differently-abled individuals and those with diverse abilities. <br /><br />

      🌐  A Platform for All: At UnitySpeak, inclusivity is at the core of our mission. Our app provides a platform where individuals of all abilities can engage in meaningful conversations, share experiences, and build connections that transcend limitations.<br /><br />

      🤝  Connecting Hearts and Minds: Communication is the heartbeat of human connection. Whether you communicate through text, voice, or video, UnitySpeak ensures that every interaction is accessible and enjoyable for everyone involved. Our user-friendly interface caters to various communication styles, ensuring a truly inclusive experience. <br /><br />

      🎙️  Voice of Empowerment: For those who face speech challenges, UnitySpeak empowers them with innovative speech-to-text features, making their voices heard effortlessly. Additionally, our app facilitates easy communication through customizable symbols and images, ensuring that no message is left unexpressed. <br /><br />

      🌈  Diverse Abilities, United Conversations: Diversity is our strength, and UnitySpeak celebrates the richness of human experience. With features designed to accommodate various abilities, our app becomes a powerful tool for fostering empathy, understanding, and unity among people from all walks of life. <br /><br />

      🚀  Seamless Integration: UnitySpeak seamlessly integrates into your daily life, offering a wide range of features that adapt to your unique communication needs. From interactive chat rooms to personalized communication boards, we are committed to providing a platform that evolves with you. <br /><br />

      Join us on this journey of breaking down communication barriers, one conversation at a time. Download UnitySpeak today and be part of a community where everyone's voice is not just heard but celebrated. Together, let's create a world where communication knows no limits. <br /><br />
    </>
  );
}

function About() {
  return (
    <>This is About page</>
  );
}

function ContactUs() {
  return (
    <>This is Contact us page</>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [record, setRecord] = useState(false); // State to control recording
  const [blob, setBlob] = useState(null); // State to store recorded audio
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

  return (
    <>
      <main className="flex flex-col gap-y-5 bg-gray-900">
        {messages && messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {renderAudio()}
        {renderImage()}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage} className="bg-gray-900 text-slate-50">

        <input
          type="text" id="first_name"
          className="bg-gray-50 border border-gray-300 text-slate-50 outline-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
          placeholder="Type a message or record a voice message"
          onChange={(e) => setFormValue(e.target.value)}
          value={formValue}
        />

        <ReactMic
          record={record}
          onStop={onRecordingComplete}
          strokeColor="#000000"
          backgroundColor="#e37034"
        />

        <button type="button" onClick={() => setRecord(!record)} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
          <span className={`relative flex items-center gap-x-3 px-5 py-2.5 transition-all ease-in duration-100 bg-white ${record ? "bg-transparent" : "bg-gray-900"} dark:bg-gray-900 rounded-md`}>{record ? 'Stop Recording' : 'Start Recording'}</span>
        </button>

        <input type='file' accept="image/*" onChange={handleImageChange} />

        <button type="submit" disabled={!formValue && !blob && !image}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const selectedPreference = props.selectedPreference;
  const { text, uid, photoURL, audioURL, imageURL } = props.message;
  const [responseImage, setResponseImage] = useState(null);
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const [transcription, setTranscription] = useState(null);

  const textToSpeech = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const params = {
    audio: audioURL,
  };

  const speechToText = async () => {
    try {
      // Assuming you have a properly initialized 'client' object
      const transcript = await client.transcripts.transcribe(params);
      setTranscription(transcript.text);
    } catch (error) {
      console.log('Error converting audio to text:', error);
    }
  };


  useEffect(() => {
    console.log("it is what it is", selectedPreference);
    // Call speechToText when the component mounts or when selectedPreference changes
    speechToText();

    // Clean up the transcription when the component unmounts
    return () => {
      setTranscription(null);
    };
  }, [selectedPreference, audioURL]);

  useEffect(() => {
    if (imageURL && selectedPreference == "Color-Blindness") {
      handleImageUpload();
    }
  }, [selectedPreference]);

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append('image', imageURL);
    try {
      const response = await fetch('https://bridge-together-cvcx.vercel.app/simulate-color-blind/deuteranopia', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        setResponseImage(responseData.simulatedImageUrl);
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error during image upload:', error);
    }
  };

  return (
    <div className={`message ${messageClass} flex gap-x-3 items-center px-8`}>
      <img className="rounded-full w-8 h-8" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="user" />
      {selectedPreference === 'Blindness' ? (
        <div>
          {text && <button onclick={() => textToSpeech(text)}>{text}</button>}
        </div>
      ) : (
        !audioURL && <p className="bg-slate-50 px-4 py-2 rounded-3xl">{text}</p>
      )}
      {selectedPreference === 'Deafness' && audioURL ? <p className="bg-slate-50 px-4 py-2 rounded-3xl">{transcription}</p> : <></>}
      {imageURL && selectedPreference == "Color-Blindness" && <img src={responseImage} className="rounded-xl" alt="image" style={{ width: '300px', aspectRatio: '[3/2]' }} />}
      {imageURL && !(selectedPreference === "Color-Blindness") && <img src={imageURL} className="rounded-xl" alt="image" style={{ width: '300px', aspectRatio: '[3/2]' }} />}
    </div>
  );
}

export default App;