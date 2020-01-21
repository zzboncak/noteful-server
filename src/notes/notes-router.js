const express = require('express');
const path = require('path')
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: xss(note.modified),
    folder_id: note.folder_id,
    note_content: xss(note.note_content)
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(
            req.app.get('db')
        )
            .then(notes => {
                let sanitizedNotes = notes.map(note => serializeNote(note));
                res.json(sanitizedNotes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { note_name, modified, folder_id, note_content } = req.body;
        const newNote = { note_name, modified, folder_id, note_content };

        const requiredFields = {
            note_name: newNote.note_name, 
            folder_id: newNote.folder_id, 
            note_content: newNote.note_content
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value == null) {
              return res.status(400).json({
                error: {message: `Missing '${key}' in request body`}
              });
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${note.id}`))
                .json(serializeNote(note))
        })
        .catch(next)
    });

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
        .then(note => {
            if(!note) {
                return res.status(404).json({
                    error: {message: 'Note does not exist'}
                })
            }
            res.note = note;
            next();
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { note_name, modified, folder_id, note_content } = req.body;
        const noteToUpdate = { note_name, modified, folder_id, note_content };

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'note_name', 'modified', 'folder_id', or 'note_content'`
                }
            });
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    });

module.exports = notesRouter;