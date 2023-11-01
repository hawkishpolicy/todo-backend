const express = require("express");
const notesRouter = express.Router();

const { requireUser, requireAdmin } = require("./utils");
const {
  //Notes//
  getAllNotes,
  getNotesByUser,
  getArchivedNotesByUser,
  createNote,
  editNoteTitle,
  editNoteColor,
  deleteNote,
  archiveNote,
  unarchiveNote,

  //Items//
  getAllItems,
  getItemsByNoteId,
  createItem,
  editItemName,
  deleteItem,

  //Labels//
  getAllLabels,
  getLabelsByUser,
  getActiveLabelsByUser,
  getLabelsByNoteId,
  createLabel,
  addLabelToNote,
  removeLabelFromNote,
  editLabel,
  deleteLabel,
  getNoteById,
  editItemStatus,
  createNotesLabels,
  getNotesByLabel,
  getNotesLabelsByUser,
} = require("../db");

//GET All Notes  ***needs Admin***
//GET /api/notes/all_notes

notesRouter.get("/all_notes", requireAdmin, async (req, res, next) => {
  try {
    const notes = await getAllNotes();
    if (!notes) {
      next({
        name: "NoNotesError",
        message: "There are no notes in the database",
      });
    } else {
      res.send({ notes: notes, success: true });
    }
  } catch (error) {
    next(error);
  }
});

//GET Notes By User
//GET "/api/notes/user"

notesRouter.get("/user", requireUser, async (req, res, next) => {
  try {
    const id = req.user.id;
    const notes = await getNotesByUser(id);
    if (!notes) {
      next({
        name: "NoNotesError",
        message: "There are no notes in the database",
      });
    } else {
      res.send({
        notes: notes,
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//GET Archived Notes By User
//GET "/api/notes/user/archived"

notesRouter.get("/user/archived", requireUser, async (req, res, next) => {
  try {
    const { id } = req.user;
    const notes = await getArchivedNotesByUser(id);
    if (notes.length === 0 || !notes) {
      next({
        name: "NoNotesError",
        message: "There are no archived notes in the database",
      });
    } else {
      res.send({
        notes: notes,
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//POST Create Note
//POST "/api/notes/user/create_note"

notesRouter.post("/user/create_note", requireUser, async (req, res, next) => {
  try {
    const { title, name, color, label_name } = req.body;
    const { id } = req.user;
    const newNote = await createNote({
      userId: id,
      title: title || "No Title",
      color: color || "gray",
    });

    const noteId = newNote.id;
    const newItem = await createItem({
      id: noteId,
      name: name || "No Item",
      completed: false,
    });

    const newLabel = await createLabel({
      label_name: label_name || "No Label",
    });
    if (!newNote) {
      next({
        name: "NoteCreationError",
        message: "Note does not exist",
      });
    } else {
      res.send({
        note: { ...newNote, items: [newItem], labels: [newLabel] },
        success: true,
      });
    }
  } catch ({ name, complete, message }) {
    next({ name, complete, message });
  }
});

//Edit Note Title
//PATCH "/api/notes/user/edit_note"

notesRouter.patch("/user/edit_note", requireUser, async (req, res, next) => {
  try {
    const { id, title } = req.body;

    const editedNote = await editNoteTitle({
      id: id,
      title: title,
    });

    let noteId = editedNote.id;
    const note = await getNoteById(noteId);
    const items = await getItemsByNoteId(noteId);
    const labels = await getLabelsByNoteId(noteId);
    if (!editedNote) {
      next({
        name: "NoteEditError",
        message: "Note does not exist",
      });
    } else {
      res.send({
        note: { ...editedNote, items: items, labels: labels },
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//Edit Note Color
//PATCH "/api/notes/user/edit_note_color"

notesRouter.patch(
  "/user/edit_note_color",
  requireUser,
  async (req, res, next) => {
    try {
      const { id, color } = req.body;

      const editedNote = await editNoteColor({
        id: id,
        color: color,
      });
      let noteId = editedNote.id;
      const items = await getItemsByNoteId(noteId);
      const labels = await getLabelsByNoteId(noteId);
      if (!editedNote) {
        next({
          name: "NoteEditError",
          message: "Note does not exist",
        });
      } else {
        res.send({
          note: { ...editedNote, items: items, labels: labels },
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

//DELETE Note
//DELETE "/api/notes/user/delete_note"

notesRouter.delete("/user/delete_note", requireUser, async (req, res, next) => {
  try {
    const { id } = req.body;
    const deletedNote = await deleteNote(id);

    let noteId = deletedNote.id;
    const items = await getItemsByNoteId(noteId);

    const labels = await getLabelsByNoteId(noteId);

    if (!deletedNote) {
      next({
        name: "NoteDeleteError",
        message: "Note does not exist",
      });
    } else {
      res.send({
        note: {
          ...deletedNote,
          items: items,
          labels: labels,
        },
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//ARCHIVE Note
//PATCH "/api/notes/user/archive"

notesRouter.patch("/user/archive_note", requireUser, async (req, res, next) => {
  try {
    const { id } = req.body;
    const archivedNote = await archiveNote(id);

    let noteId = archivedNote.id;
    const items = await getItemsByNoteId(noteId);
    const labels = await getLabelsByNoteId(noteId);
    if (!archivedNote) {
      next({
        name: "NoteArchiveError",
        message: "Note does not exist",
      });
    } else {
      res.send({
        note: { ...archivedNote, items: items, labels: labels },
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//UNARCHIVE Note
//PATCH "/api/notes/user/unarchive"

notesRouter.patch(
  "/user/unarchive_note",
  requireUser,
  async (req, res, next) => {
    try {
      const { id } = req.body;
      const unArchivedNote = await unarchiveNote(id);

      let noteId = unArchivedNote.id;
      const items = await getItemsByNoteId(noteId);
      const labels = await getLabelsByNoteId(noteId);
      if (!unArchivedNote) {
        next({
          name: "NoteUnarchiveError",
          message: "Note does not exist",
        });
      } else {
        res.send({
          note: { ...unArchivedNote, items: items, labels: labels },
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

//GET All Items ***needs Admin***
//GET "/api/notes/all_items"

notesRouter.get("/all_items", requireAdmin, async (req, res, next) => {
  try {
    const items = await getAllItems();
    if (!items) {
      next({
        name: "NoItemsError",
        message: "There are no items in the database",
      });
    } else {
      res.send({ items: items, success: true });
    }
  } catch (error) {
    next(error);
  }
});

//POST Create Item For Note
//POST "/api/notes/user/add_item"

notesRouter.post("/user/add_item", requireUser, async (req, res, next) => {
  try {
    const { id, name } = req.body;
    const newItem = await createItem({
      id: id,
      name: name,
      completed: false,
    });

    const note = await getNoteById(id);

    let noteId = note.id;
    const items = await getItemsByNoteId(noteId);
    const labels = await getLabelsByNoteId(noteId);

    if (!newItem) {
      next({
        name: "ItemCreationError",
        message: "Item does not exist",
      });
    } else {
      res.send({
        note: { ...note, items: items, labels: labels },
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//PATCH Edit Item For Note
//PATCH "/api/notes/user/edit_item/"

notesRouter.patch("/user/edit_item", requireUser, async (req, res, next) => {
  try {
    const { id, name, noteId } = req.body;

    const editedItem = await editItemName({
      id: id,
      name: name,
    });

    const items = await getItemsByNoteId(noteId);
    const note = await getNoteById(noteId);
    const labels = await getLabelsByNoteId(noteId);

    if (!editedItem) {
      next({
        name: "ItemEditError",
        message: "Item does not exist",
      });
    } else {
      res.send({
        note: { ...note, items: items, labels: labels },
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//PATCH Toggle Item Status
//PATCH "/api/notes/user/toggle_status"

notesRouter.patch(
  "/user/toggle_status",
  requireUser,
  async (req, res, next) => {
    try {
      const { id, completed, noteId } = req.body;

      const editedItem = await editItemStatus(id, completed);

      const note = await getNoteById(noteId);
      const items = await getItemsByNoteId(noteId);
      const labels = await getLabelsByNoteId(noteId);

      if (!editedItem) {
        next({
          name: "ItemEditError",
          message: "Item does not exist",
        });
      } else {
        res.send({
          note: { ...note, items: items, labels: labels },
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

//DELETE Item For Note
//DELETE "/api/notes/user/delete_item"

notesRouter.delete("/user/delete_item", requireUser, async (req, res, next) => {
  try {
    const { itemId, noteId } = req.body;
    const deletedItem = await deleteItem(itemId);

    const note = await getNoteById(noteId);
    const items = await getItemsByNoteId(noteId);
    const labels = await getLabelsByNoteId(noteId);

    if (!deletedItem) {
      next({
        name: "ItemDeleteError",
        message: "Item does not exist",
      });
    } else {
      res.send({
        note: { ...note, items: items, labels: labels },
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//GET ALL Labels ***needs Admin***
//GET "/api/notes/all_labels"

notesRouter.get("/all_labels", requireAdmin, async (req, res, next) => {
  try {
    const labels = await getAllLabels();
    if (!labels) {
      next({
        name: "NoLabelsError",
        message: "There are no labels in the database",
      });
    } else {
      res.send({ labels: labels, success: true });
    }
  } catch (error) {
    next(error);
  }
});

//GET Active Labels By User
//GET "/api/notes/user/active_labels"

notesRouter.get("/user/active_labels", requireUser, async (req, res, next) => {
  try {
    const id = req.user.id;
    const labels = await getActiveLabelsByUser(id);
    if (!labels) {
      next({
        name: "NoLabelsError",
        message: "There are no labels in the database",
      });
    } else {
      res.send({ labels: labels, success: true });
    }
  } catch (error) {
    next(error);
  }
});

//GET User Labels
//GET "/api/notes/user/labels"

notesRouter.get("/user/labels", requireUser, async (req, res, next) => {
  try {
    const id = req.user.id;
    const labels = await getLabelsByUser(id);
    if (!labels) {
      next({
        name: "NoLabelsError",
        message: "There are no labels in the database",
      });
    } else {
      res.send({ labels: labels, success: true });
    }
  } catch (error) {
    next(error);
  }
});

//GET Notes By Label
//GET "/api/notes/user/notes_labels_by_user"

notesRouter.get("/user/notes_by_label", requireUser, async (req, res, next) => {
  try {
    const { id } = req.user;
    const notes = await getNotesLabelsByUser(id);
    if (!notes) {
      next({
        name: "NoNotesError",
        message: "There are no notes in the database",
      });
    } else {
      res.send({ notes: notes, success: true });
    }
  } catch (error) {
    next(error);
  }
});

//POST Create Label
//POST "/api/notes/user/create_label"

notesRouter.post("/user/create_label", requireUser, async (req, res, next) => {
  try {
    const { label_name } = req.body;
    const { id } = req.user;
    const newLabel = await createLabel({
      userId: id,
      label_name: label_name,
    });
    if (!newLabel) {
      next({
        name: "LabelCreationError",
        message: "Label does not exist",
      });
    } else {
      res.send({ label: newLabel, success: true });
    }
  } catch ({ name, complete, message }) {
    next({ name, complete, message });
  }
});

//PATCH Add Label To Note
//PATCH "/api/notes/user/add_label_to_note"

notesRouter.patch(
  "/user/add_label_to_note",
  requireUser,
  async (req, res, next) => {
    try {
      const { labelId, noteId } = req.body;
      const addedLabel = await addLabelToNote(labelId, noteId);

      const note = await getNoteById(noteId);
      const items = await getItemsByNoteId(noteId);
      const labels = await getLabelsByNoteId(noteId);
      if (!addedLabel) {
        next({
          name: "LabelAddError",
          message: "Label does not exist",
        });
      } else {
        res.send({
          note: { ...note, items: items, labels: labels },
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

//PATCH Remove Label From Note
//PATCH "/api/notes/user/remove_label_from_note"

notesRouter.patch(
  "/user/remove_label_from_note",
  requireUser,
  async (req, res, next) => {
    try {
      const { labelId, noteId } = req.body;
      const removedLabel = await removeLabelFromNote(labelId, noteId);

      const note = await getNoteById(noteId);
      const items = await getItemsByNoteId(noteId);
      const labels = await getLabelsByNoteId(noteId);
      if (!removedLabel) {
        next({
          name: "LabelRemoveError",
          message: "Label does not exist",
        });
      } else {
        res.send({
          note: { ...note, items: items, labels: labels },
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

//Patch Edit Label
//PATCH "/api/notes/user/edit_label"

notesRouter.patch("/user/edit_label", requireUser, async (req, res, next) => {
  try {
    const { labelId, label_name } = req.body;
    const editedLabel = await editLabel(labelId, label_name);

    if (!editedLabel) {
      next({
        name: "LabelEditError",
        message: "Label does not exist",
      });
    } else {
      res.send({
        label: editedLabel,
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
});

//DELETE Label
//DELETE "/api/notes/user/delete_label"

notesRouter.delete(
  "/user/delete_label",
  requireUser,
  async (req, res, next) => {
    try {
      const { labelId } = req.body;
      const deletedLabel = await deleteLabel(labelId);

      if (!deletedLabel) {
        next({
          name: "LabelDeleteError",
          message: "Label does not exist",
        });
      } else {
        res.send({
          label: deletedLabel,
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = notesRouter;
