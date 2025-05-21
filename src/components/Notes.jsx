import React, { useContext, useEffect, useState } from 'react';
import NoteContext from '../context/notes/NoteContext';
import Noteitem from './NoteItem';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Notes = ({ showAlert }) => {
  const context = useContext(NoteContext);
  const { notes, getNotes, addNote, editNote } = context;
  const navigate = useNavigate();

  // Folders: {id, name, noteIds[]}
  const [folders, setFolders] = useState([
    { id: 'folder-default', name: 'General', noteIds: [] },
  ]);
  const [folderName, setFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Add Note form state
  const [newNote, setNewNote] = useState({ title: '', description: '', tag: '' });

  // Drag & drop state
  const [draggedNoteId, setDraggedNoteId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else getNotes();
  }, [getNotes, navigate]);

  // When notes change, initialize folder notes if empty
  useEffect(() => {
    if (folders.length === 1 && folders[0].noteIds.length === 0 && notes.length > 0) {
      setFolders([{ id: 'folder-default', name: 'General', noteIds: notes.map(n => n._id) }]);
    }
  }, [notes]);

  // Folder CRUD functions
  const createFolder = () => {
    if (!folderName.trim()) return;
    setFolders([...folders, { id: uuidv4(), name: folderName.trim(), noteIds: [] }]);
    setFolderName('');
    showAlert('Folder created', 'success');
  };

  const deleteFolder = (folderId) => {
    if (window.confirm('Delete folder? Notes inside will be moved to General folder.')) {
      const generalFolderIndex = folders.findIndex(f => f.id === 'folder-default');
      const deletedFolder = folders.find(f => f.id === folderId);
      const updatedFolders = folders.filter(f => f.id !== folderId);

      updatedFolders[generalFolderIndex].noteIds = [
        ...updatedFolders[generalFolderIndex].noteIds,
        ...deletedFolder.noteIds,
      ];

      setFolders(updatedFolders);
      showAlert('Folder deleted', 'info');
    }
  };

  const startRenameFolder = (folderId, currentName) => {
    setEditingFolder(folderId);
    setEditingFolderName(currentName);
  };

  const renameFolder = (folderId) => {
    if (!editingFolderName.trim()) return;
    setFolders(folders.map(f => f.id === folderId ? { ...f, name: editingFolderName.trim() } : f));
    setEditingFolder(null);
    showAlert('Folder renamed', 'success');
  };

  // Drag & drop handlers
  const handleDragStart = (e, noteId) => {
    setDraggedNoteId(noteId);
  };

  const handleDropOnFolder = (e, folderId) => {
    e.preventDefault();
    if (!draggedNoteId) return;

    setFolders(folders.map(folder => {
      // Remove note from all folders
      const filteredNotes = folder.noteIds.filter(id => id !== draggedNoteId);

      if (folder.id === folderId) {
        return { ...folder, noteIds: [...filteredNotes, draggedNoteId] };
      }
      return { ...folder, noteIds: filteredNotes };
    }));

    setDraggedNoteId(null);
    showAlert('Note moved to folder', 'success');
  };

  const handleDragOver = (e) => e.preventDefault();

  // Get note by ID helper
  const getNoteById = (id) => notes.find(note => note._id === id);

  // Add new note handler
  const handleAddNote = async () => {
    if (newNote.title.trim().length < 5 || newNote.description.trim().length < 5) {
      showAlert('Title and description must be at least 5 characters', 'warning');
      return;
    }
    try {
      await addNote(newNote.title.trim(), newNote.description.trim(), newNote.tag.trim());
      // After adding note, assign to General folder (latest note id will be last in notes after addNote)
      // To keep sync, delay a bit to get new notes list or use callback/promise from addNote if available
      // Here, just optimistic: add latest note id from notes + 1 or fetch updated notes with getNotes
      setNewNote({ title: '', description: '', tag: '' });
      showAlert('Note added successfully', 'success');

      // Re-fetch notes or assume note added last
      setTimeout(() => {
        getNotes(); // refresh notes list
      }, 300);

    } catch (error) {
      showAlert('Failed to add note', 'danger');
    }
  };

  // When notes update, sync folder-default noteIds with current notes in that folder
  useEffect(() => {
    // Get all note ids currently assigned in folders (except default)
    const assignedNoteIds = folders.reduce((acc, folder) => {
      if (folder.id !== 'folder-default') return acc.concat(folder.noteIds);
      return acc;
    }, []);
    // Unassigned notes go to default folder
    const unassignedNotes = notes.filter(n => !assignedNoteIds.includes(n._id)).map(n => n._id);

    setFolders(folders.map(folder => {
      if (folder.id === 'folder-default') {
        return { ...folder, noteIds: Array.from(new Set([...folder.noteIds, ...unassignedNotes])) };
      }
      return folder;
    }));
  }, [notes]);

  return (
    <div className="container my-4">
      <h2 className="fw-bold mb-3">Your Notes with Folders</h2>

      {/* Add New Note UI */}
      <div className="card mb-4 p-3 shadow-sm">
        <h5>Add New Note</h5>
        <input
          type="text"
          placeholder="Title (min 5 chars)"
          className="form-control mb-2"
          value={newNote.title}
          onChange={e => setNewNote({ ...newNote, title: e.target.value })}
        />
        <textarea
          placeholder="Description (min 5 chars)"
          className="form-control mb-2"
          rows={3}
          value={newNote.description}
          onChange={e => setNewNote({ ...newNote, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tag (optional)"
          className="form-control mb-2"
          value={newNote.tag}
          onChange={e => setNewNote({ ...newNote, tag: e.target.value })}
        />
        <button
          className="btn btn-primary"
          onClick={handleAddNote}
          disabled={newNote.title.trim().length < 5 || newNote.description.trim().length < 5}
        >
          Add Note
        </button>
      </div>

      {/* Folder creation */}
      <div className="d-flex mb-4">
        <input
          type="text"
          className="form-control me-2"
          placeholder="New folder name"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') createFolder(); }}
        />
        <button className="btn btn-outline-primary" onClick={createFolder}>+ Add Folder</button>
      </div>

      {/* Folder list */}
      <div className="row">
        {folders.map(folder => (
          <div
            key={folder.id}
            className="col-md-4 mb-4"
            onDrop={e => handleDropOnFolder(e, folder.id)}
            onDragOver={handleDragOver}
            style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '10px', minHeight: '200px', background: '#f9f9f9' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              {editingFolder === folder.id ? (
                <>
                  <input
                    type="text"
                    className="form-control me-2"
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') renameFolder(folder.id); }}
                    autoFocus
                  />
                  <button className="btn btn-success btn-sm" onClick={() => renameFolder(folder.id)}>Save</button>
                  <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditingFolder(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <h5>{folder.name}</h5>
                  {folder.id !== 'folder-default' && (
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => startRenameFolder(folder.id, folder.name)}>Rename</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteFolder(folder.id)}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes in folder */}
            {folder.noteIds.length === 0 && <p className="text-muted">No notes in this folder.</p>}

            {folder.noteIds.map(noteId => {
              const note = getNoteById(noteId);
              if (!note) return null;
              return (
                <div
                  key={note._id}
                  draggable
                  onDragStart={e => handleDragStart(e, note._id)}
                  style={{ marginBottom: '8px' }}
                >
                  <Noteitem
                    note={note}
                    updateNote={() => {}}
                    showAlert={showAlert}
                    viewNote={() => {}}
                />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
