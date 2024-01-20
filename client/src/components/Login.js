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
    <div className="login_form_container">
      <button onClick={handleGoogleSignIn}>
        <span>Continue with Google</span>
      </button>
    </div>
  );
}

export default Login;
