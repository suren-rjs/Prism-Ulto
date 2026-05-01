export class Notes {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.panel = document.getElementById('notesPanel');
    this.toggleBtn = document.getElementById('notesToggleBtn');
    this.closeBtn = document.getElementById('closeNotesBtn');
    this.listView = document.getElementById('notesListView');
    this.editorView = document.getElementById('notesEditorView');
    this.notesList = document.getElementById('notesList');
    this.addBtn = document.getElementById('addNoteBtn');
    this.backBtn = document.getElementById('backToNotesBtn');
    this.saveBtn = document.getElementById('saveNoteBtn');
    this.deleteBtn = document.getElementById('deleteNoteBtn');
    
    this.titleInput = document.getElementById('noteTitleInput');
    this.contentArea = document.getElementById('notesArea');
    
    this.currentNoteId = null;
  }

  init() {
    this.renderList();
    this.setupListeners();
  }

  setupListeners() {
    this.toggleBtn.addEventListener('click', () => {
      this.panel.classList.toggle('open');
      if (this.panel.classList.contains('open')) {
        this.showList();
      }
    });

    this.closeBtn.addEventListener('click', () => this.panel.classList.remove('open'));
    
    this.addBtn.addEventListener('click', () => this.showEditor());
    
    this.backBtn.addEventListener('click', () => this.showList());
    
    this.saveBtn.addEventListener('click', () => this.saveCurrentNote());
    
    this.deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this note?')) {
        this.deleteCurrentNote();
      }
    });

    // Auto-save content while typing
    this.contentArea.addEventListener('input', () => {
      if (this.currentNoteId) {
        this.saveCurrentNote(true);
      }
    });
  }

  renderList() {
    const notes = this.stateManager.get('notes') || [];
    if (notes.length === 0) {
      this.notesList.innerHTML = '<p class="status-msg">No notes yet. Click + to add one!</p>';
      return;
    }

    // Sort by updatedAt desc
    const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

    this.notesList.innerHTML = sortedNotes.map(note => `
      <div class="note-item" data-id="${note.id}">
        <div class="note-item-title">${note.title || 'Untitled Note'}</div>
        <div class="note-item-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
      </div>
    `).join('');

    this.notesList.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        this.showEditor(parseInt(item.dataset.id));
      });
    });
  }

  showList() {
    this.listView.style.display = 'flex';
    this.editorView.style.display = 'none';
    this.addBtn.style.display = 'block';
    this.currentNoteId = null;
    this.renderList();
  }

  showEditor(noteId = null) {
    this.listView.style.display = 'none';
    this.editorView.style.display = 'flex';
    this.addBtn.style.display = 'none';
    
    if (noteId) {
      const notes = this.stateManager.get('notes');
      const note = notes.find(n => n.id === noteId);
      this.currentNoteId = noteId;
      this.titleInput.value = note.title;
      this.contentArea.value = note.content;
      this.deleteBtn.style.display = 'block';
    } else {
      this.currentNoteId = null;
      this.titleInput.value = '';
      this.contentArea.value = '';
      this.deleteBtn.style.display = 'none';
      this.titleInput.focus();
    }
  }

  saveCurrentNote(isAutoSave = false) {
    const title = this.titleInput.value.trim() || 'Untitled Note';
    const content = this.contentArea.value;
    const notes = this.stateManager.get('notes') || [];
    
    if (!this.currentNoteId) {
      // New note
      const newNote = {
        id: Date.now(),
        title,
        content,
        updatedAt: Date.now()
      };
      notes.push(newNote);
      this.currentNoteId = newNote.id;
      this.deleteBtn.style.display = 'block';
    } else {
      // Update existing
      const noteIndex = notes.findIndex(n => n.id === this.currentNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          content,
          updatedAt: Date.now()
        };
      }
    }
    
    this.stateManager.set('notes', notes);
    if (!isAutoSave) {
      this.showList();
    }
  }

  deleteCurrentNote() {
    if (!this.currentNoteId) return;
    
    const notes = this.stateManager.get('notes') || [];
    const filteredNotes = notes.filter(n => n.id !== this.currentNoteId);
    
    this.stateManager.set('notes', filteredNotes);
    this.showList();
  }
}
