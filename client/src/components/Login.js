import { useState } from "react";
import "../index.css";
import "../styles/Login.css";
import { getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import { addDoc, getDocs, query, where } from "firebase/firestore";
import { usersCollection } from "../firebaseConfig";


function Login () {
    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth();
            const response = await signInWithPopup(auth, provider);
            console.log("User signed in successfully", response);
            const userObject = {
                name: response.user.displayName,
                email: response.user.email,
                profilePicture: response.user.photoURL
            };
            const existingUserQuery = query(usersCollection, where("email", "==", userObject.email));
            const existingUserSnapshot = await getDocs(existingUserQuery);
            if (existingUserSnapshot.size === 0) {
                const addedUser = await addDoc(usersCollection, userObject);
                console.log("New User added");
                localStorage.setItem("expenseTrackerUserFirebaseRefId", JSON.stringify(addedUser.id));
                // window.location.reload();
            } else {
                existingUserSnapshot.forEach((doc) => {
                console.log("User already exists: ", doc.id);
                localStorage.setItem("expenseTrackerUserFirebaseRefId", JSON.stringify(doc.id));
                // window.location.reload();
                });
            }
        } catch (error) {
            console.log("Some error occurred", error);
        }
    };

  return (
    <button onClick={handleGoogleSignIn} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
      <span className="relative flex items-center gap-x-3 px-5 py-2.5 transition-all ease-in duration-100 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-icon"/>
        Sign In with Google
      </span>
    </button>
  );
}

export default Login;
