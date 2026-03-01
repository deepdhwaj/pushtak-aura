const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const bookpath = "public/books";
/* Ensure books folder exists */
if (!fs.existsSync(bookpath)) {
    fs.mkdirSync(bookpath);
}

/* Metadata file path */
const metadataPath = path.join(bookpath, "metadata.js");

/* Initialize metadata file if not exists */
if (!fs.existsSync(metadataPath)) {
    fs.writeFileSync(metadataPath, "const books = {};\n\nmodule.exports = books;");
}

/* Load existing metadata */
function loadMetadata() {
    delete require.cache[require.resolve("./public/books/metadata.js")];
    return require("./public/books/metadata.js");
}

/* Save metadata */
function saveMetadata(data) {
    const content =
        "const books = " +
        JSON.stringify(data, null, 2) +
        ";\n\nmodule.exports = books;";
    fs.writeFileSync(metadataPath, content);
}

/* Multer Storage */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/books/");
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const nameWithoutExt = path.parse(file.originalname).name;
        const uniqueBase = timestamp + "-" + nameWithoutExt;

        if (file.fieldname === "pdf_file") {
            cb(null, uniqueBase + ".pdf");
        } else {
            cb(null, uniqueBase + path.extname(file.originalname));
        }
    }
});

const upload = multer({ storage });

app.get("/health",(req,res)=>{
    res.json({
        message: "All is set!"
    })
})

/* ================= GET ALL BOOKS ================= */
app.get("/api/books", (req, res) => {
    try {
        const books = loadMetadata();

        // Convert object into array
        const booksArray = Object.keys(books).map(key => ({
            key,
            ...books[key]
        }));

        res.json({
            success: true,
            count: booksArray.length,
            books: booksArray
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching books"
        });
    }
});

/* Upload Endpoint */
app.post("/upload-book", upload.fields([
    { name: "pdfFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), (req, res) => {

    console.log('uploading book');
    console.log(req.body);
    console.log(req.files);
    const pdfFile = req.files["pdfFile"][0];
    const thumbFile = req.files["thumbnail"][0];

    const key = path.parse(pdfFile.filename).name; // filename without extension

    const books = loadMetadata();

    books[key] = {
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        publish_date: req.body.publish_date,
        isbn: req.body.isbn,
        pdf: pdfFile.filename,
        thumbnail: thumbFile.filename
    };

    saveMetadata(books);

    res.json({ message: "Book + Metadata stored successfully!", key });
});

/* Serve entire public folder */
app.use(express.static(path.join(__dirname, "public")));

/* Default route */
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
    res.sendFile(path.join(__dirname, "public", "html/book-media-gird-view.html"));
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

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html/contact.html"));
});



/* Start server */
app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});