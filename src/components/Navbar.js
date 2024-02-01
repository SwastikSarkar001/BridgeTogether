import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import SignOut from './SignOut';
import SignIn from './SignIn';
import { Link } from 'react-router-dom';

function Navbar(props) {
  const [user] = useAuthState(auth);
  const setSelectedPreference = props.setSelectedPreference;
  const selectedPreference = props.selectedPreference;

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
    console.log("prefernece is ",preference);
  }, []);

  const location = props.useLocation();
  const activeClass = "block py-2 px-3 md:p-0 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500";
  const inactiveClass = "block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700";
  return (
    <nav className="sticky top-0 bg-white border-gray-200 dark:bg-gray-900">
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
                <option value='cone-monochromacy'>cone-monochromacy</option>
                <option value='rod-monochromacy'>rod-monochromacy</option>
                <option value='protanopia'>protanopia</option>
                <option value='deuteranopia'>deuteranopia</option>
                <option value='tritanopia'>tritanopia</option>
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

export default Navbar;