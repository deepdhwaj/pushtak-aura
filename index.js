require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { uploadBook, getBooksWithUrls, deleteBook, ensureBucketExists, ensureTableExists } = require("./services/aws-service");

const app = express();
app.use(cors());
app.use(express.json());

/* Multer memory storage - files kept in RAM for S3 upload */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, /* 50MB max */
});

app.get("/health", (req, res) => {
    res.json({ message: "All is set!" });
});

/* ================= GET ALL BOOKS (from DynamoDB + presigned S3 URLs) ================= */
app.get("/api/books", async (req, res) => {
    try {
        const books = await getBooksWithUrls(3600);

        res.json({
            success: true,
            count: books.length,
            books,
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching books",
        });
    }
});

/* Upload Endpoint - S3 + DynamoDB */
app.post(
    "/upload-book",
    upload.fields([
        { name: "pdfFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            if (!req.files?.pdfFile?.[0] || !req.files?.thumbnail?.[0]) {
                return res.status(400).json({
                    message: "Both PDF and thumbnail are required",
                });
            }

            const pdfFile = req.files.pdfFile[0];
            const thumbFile = req.files.thumbnail[0];

            const metadata = {
                title: req.body.title,
                description: req.body.description,
                author: req.body.author,
                publish_date: req.body.publish_date || req.body.publishDate,
                isbn: req.body.isbn,
            };

            const { key } = await uploadBook({
                pdfBuffer: pdfFile.buffer,
                pdfOriginalName: pdfFile.originalname,
                thumbnailBuffer: thumbFile.buffer,
                thumbnailOriginalName: thumbFile.originalname,
                metadata,
            });

            res.json({ message: "Book + Metadata stored successfully!", key });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({
                message: "Upload failed",
            });
        }
    }
);

/* ================= DELETE BOOK ================= */
app.delete("/api/books/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await deleteBook(id);
        res.json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
        console.error("Delete book error:", error);
        const status = error.message === "Book not found" ? 404 : 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to delete book",
        });
    }
});

/* Page routes - must be before static to avoid 404 */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/index.html"));
});

app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/book-upload.html"));
});

app.get("/books-media", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/books-media-list-view.html"));
});

app.get("/books-media-gird", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/books-media-gird-view.html"));
});

app.get("/news-events", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/news-events-details.html"));
});

app.get("/news-events-list", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/news-events-list-view.html"));
});

app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/cart.html"));
});

app.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/checkout.html"));
});

app.get("/fileupload", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/fileupload.html"));
});

app.get("/post", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/post-detail.html"));
});

app.get("/services", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/services.html"));
});

app.get("/sigin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/signin.html"));
});

app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/signin.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/signup.html"));
});

app.get("/temp", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/temp.html"));
});

app.get("/wishlist", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/wishlist.html"));
});

app.get("/virtual", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/www.virtualsoft.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/about-us.html"));
});

app.get("/blog", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/blog-list.html"));
});

app.get("/blog-grid", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/blog-grid.html"));
});

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/contact.html"));
});

app.get("/404", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/404.html"));
});

/* Serve entire public folder (after routes) */
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

/* Start server */
async function start() {
    try {
        await ensureBucketExists();
    } catch (err) {
        console.error("S3 bucket check/create failed:", err.message);
    }
    try {
        await ensureTableExists();
    } catch (err) {
        console.error("DynamoDB table check/create failed:", err.message);
    }
    app.listen(PORT, () => {
        console.log("Server running at http://localhost:5000");
    });
}
start();