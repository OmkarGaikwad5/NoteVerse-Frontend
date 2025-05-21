import React, { useContext } from 'react';
import NoteContext from '../context/notes/NoteContext';

const Noteitem = ({ note, updateNote, showAlert, viewNote }) => {
  const { deleteNote } = useContext(NoteContext);

  const handleDelete = () => {
    deleteNote(note._id);
    showAlert("Note Deleted successfully", "success");
   
  };

  return (
    <div className="col-md-3">
      <div className="card my-3 shadow-sm">
        <div className="card-body">
          <div 
            className="d-flex align-items-center justify-content-between"
            style={{ overflow: 'hidden' }}  // Prevent content overflow
          >
            <h5 
              className="card-title mb-0 text-truncate"  // Truncate long titles 
              style={{ maxWidth: '60%' }} // Adjust width for 3 icons
            >
              {note.title}
            </h5>
            <div>
              <i
                className="far fa-eye text-success mx-1"
                style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                onClick={() => viewNote(note)}
                title="View note"
              ></i>
              <i 
                className="far fa-edit text-primary mx-1" 
                style={{ cursor: 'pointer', fontSize: '1.1rem' }} 
                onClick={() => updateNote(note)}
                title="Edit note"
              ></i>
              <i 
                className="far fa-trash-alt text-danger mx-1" 
                style={{ cursor: 'pointer', fontSize: '1.1rem' }} 
                onClick={handleDelete}
                
                title="Delete note"
                
              ></i>
            </div>
          </div>
          <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{note.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Noteitem;
