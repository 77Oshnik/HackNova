import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
  const { isSignedIn } = useUser();

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-semibold text-gray-800">
          HackNova  
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/trip" className="text-gray-700 hover:text-gray-900 text-lg">
            Dashboard
          </Link>

          {isSignedIn ? (
            <SignOutButton>
              <button className="bg-red-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-600 transition">
                Sign Out
              </button>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
