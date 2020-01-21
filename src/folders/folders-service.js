const FoldersService = {
    getAllFolders(knex) {
        return knex
            .select('*')
            .from('folders');
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('folders')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    getById(knex, folderId) {
        return knex
            .select('*')
            .from('folders')
            .where('id', folderId)
            .first();
    },
    deleteFolder(knex, folderId) {
        return knex('folders')
            .where('id', folderId)
            .delete();
    },
    updateFolder(knex, folderId, newFolderField) {
        return knex('folders')
            .where('id', folderId)
            .update(newFolderField);
    },
};

module.exports = FoldersService;