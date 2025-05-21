import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NoteContext from '../context/notes/NoteContext';

function Navbar() {
  const location = useLocation();
  const { setSearchQuery } = useContext(NoteContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in based on the presence of the token in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // If token exists, user is logged in

    // Set mode class on the body element
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${mode}-mode`);

    // Store the selected mode in localStorage
    localStorage.setItem('mode', mode);
  }, [mode,navigate]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = mode === 'dark';

  const handleLogout = ({showAlert}) => {
    localStorage.removeItem('token'); // Remove token on logout
    setIsLoggedIn(false);
    navigate('/login'); // Redirect to the login page
    showAlert("Logged Out Successfully","success"); // Update the state to reflect logout
  };

  return (
    <nav className={`navbar navbar-expand-lg ${isDark ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
      <div className="container-fluid">
        <Link
          className={`nav-link ${location.pathname === "/" ? "active" : ""} text-decoration-none me-4`}
          to="/"
        >
          NoteVerse
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/" ? "active" : ""} text-decoration-none me-4`}
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
                to="/about"
              >
                About
              </Link>
            </li>
          </ul>

          <form className="d-flex me-3" role="search">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control me-2"
              type="search"
              placeholder="Search notes"
              aria-label="Search"
            />
            <button className='btn btn-primary'>Search</button>
          </form>

          {/* Dark/Light Mode Toggle Switch */}
          <label className="switch">
            <input
              type="checkbox"
              checked={isDark}
              onChange={toggleMode}
            />
            <span className="slider round"></span>
            <span className={`mode-label ${isDark ? 'text-light' : 'text-dark'}`}>
              {isDark ? '🌙' : '🌞'}
            </span>
          </label>

          {/* Login/Sign Up buttons or Logout button */}
          {!isLoggedIn ? (
            <div className="d-flex ms-3">
              <Link to="/login">
                <button className="btn btn-outline-primary me-2 py-2 px-4 rounded-pill shadow-sm border-0">
                  <i className="fas fa-sign-in-alt me-2"></i> Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="btn btn-primary py-2 px-4 rounded-pill shadow-sm border-0">
                  <i className="fas fa-user-plus me-2"></i> Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="btn btn-danger ms-3 py-2 px-4 rounded-pill shadow-sm border-0"
            >
              <i className="fas fa-sign-out-alt me-2"></i> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
