const NotesService = {
    getAllNotes(knex) {
        return knex
            .select('*')
            .from('notes');
    },
    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('notes')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    getById(knex, noteId) {
        return knex
            .select('*')
            .from('notes')
            .where('id', noteId)
            .first();
    },
    deleteNote(knex, noteId) {
        return knex('notes')
            .where('id', noteId)
            .delete();
    },
    updateNote(knex, noteId, newNoteFields) {
        return knex('notes')
            .where('id', noteId)
            .update(newNoteFields);
    },
};

module.exports = NotesService;