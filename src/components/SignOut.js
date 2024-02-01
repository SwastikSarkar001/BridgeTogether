import { auth } from "./firebase";

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

export default SignOut;