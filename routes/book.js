var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const { Op } = require("../models").Sequelize;

//Async handler
const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
/* GET home page. */
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
    res.render("index", { books, title: "Books" });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const books = await Book.findAll({
      where: {
        title: {
          [Op.substring]: req.body.title,
        },
      },
      order: [["createdAt", "DESC"]],
    });
    if (books.length > 0) {
      res.render("results", {
        books,
        title: `Books matching "${req.body.title}":`,
      });
    } else {
      const error = new Error(
        "Sorry, the book(s) you're looking for are in another castle :("
      );
      res.render("results", {
        error,
        title: `Books matching "${req.body.title}":`,
      });
    }
  })
);
router.get(
  "/new",
  asyncHandler(async (req, res, next) => {
    res.render("new-book", {
      button: "Create New Book",
      book: {},
      title: "New Book",
    });
  })
);

router.post(
  "/new",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("new-book", {
          book,
          errors: error.errors,
          title: "New Book",
          button: "Create New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book.pug", {
        book,
        button: "Update Book",
        title: "Update Book",
      });
    } else {
      res.status(404);
      next();
    }
  })
);

router.post(
  "/:id",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        res.status(404);
        next();
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: error.errors,
          title: "Update Book",
          button: "Update Book",
        });
      } else {
        throw error;
      }
    }
  })
);

router.get(
  "/:id/delete",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("delete", { book, title: "Delete Book" });
    } else {
      res.status(404);
      next();
    }
  })
);

router.post(
  "/:id/delete",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.status(404);
      next();
    }
  })
);

module.exports = router;
