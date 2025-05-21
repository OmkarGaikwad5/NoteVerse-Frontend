// App.js
import './App.css';
import About from './components/About';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Alert from './components/Alert'; // ✅ import Alert
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NoteState from './context/notes/NoteState';
import Notes from './components/Notes';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // hide after 3 seconds
  };

  return (
    <NoteState>
      <BrowserRouter>
        <Navbar />
        <Alert alert={alert} /> {/* ✅ Display Alert */}
        <Routes>
          <Route
            path="/"
            element={
              <DndProvider backend={HTML5Backend}>
                <Notes showAlert={showAlert} />
              </DndProvider>
            }
          />
          <Route path="/login" element={<Login showAlert={showAlert} />} />
          <Route path="/signup" element={<SignUp showAlert={showAlert} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </NoteState>
  );
}

export default App;

