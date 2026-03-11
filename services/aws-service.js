/**
 * AWS Service - S3 and DynamoDB operations for Pustak Aura
 * Reads credentials from env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
 * Requires: S3_BUCKET_NAME, DYNAMODB_TABLE_NAME
 */

const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
    DynamoDBClient,
    CreateTableCommand,
    DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
    DeleteCommand,
    GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.S3_BUCKET_NAME;
const tableName = process.env.DYNAMODB_TABLE_NAME || "pustak-aura-books";

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const dynamoClient = new DynamoDBClient({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
    marshallOptions: { removeUndefinedValues: true },
});

/**
 * Create S3 bucket if it does not exist
 * @returns {Promise<void>}
 */
async function ensureBucketExists() {
    if (!bucketName) return;

    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (err) {
        const isNotFound = err.name === "NotFound" || err.name === "NoSuchBucket" || err.$metadata?.httpStatusCode === 404;
        if (isNotFound) {
            const params = { Bucket: bucketName };
            if (region !== "us-east-1") {
                params.CreateBucketConfiguration = { LocationConstraint: region };
            }
            await s3Client.send(new CreateBucketCommand(params));
            console.log(`S3 bucket "${bucketName}" created.`);
        } else {
            throw err;
        }
    }
}

/**
 * Create DynamoDB table if it does not exist
 * @returns {Promise<void>}
 */
async function ensureTableExists() {
    if (!tableName) return;

    try {
        await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    } catch (err) {
        const isNotFound = err.name === "ResourceNotFoundException" || err.$metadata?.httpStatusCode === 400;
        if (isNotFound) {
            await dynamoClient.send(
                new CreateTableCommand({
                    TableName: tableName,
                    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
                    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
                    BillingMode: "PAY_PER_REQUEST",
                })
            );
            /* Wait for table to become ACTIVE */
            for (let i = 0; i < 30; i++) {
                const desc = await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
                if (desc.Table?.TableStatus === "ACTIVE") break;
                await new Promise((r) => setTimeout(r, 1000));
            }
            console.log(`DynamoDB table "${tableName}" created.`);
        } else {
            throw err;
        }
    }
}

/**
 * Upload a file buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 object key (path)
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} S3 key
 */
async function uploadToS3(buffer, key, contentType) {
    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME is not configured");
    }

    await s3Client.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return key;
}

/**
 * Generate presigned URL for S3 object (valid 1 hour)
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Seconds until URL expires (default 3600)
 * @returns {Promise<string>} Presigned URL
 */
async function getPresignedUrl(key, expiresIn = 3600) {
    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME is not configured");
    }

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Save book metadata to DynamoDB
 * @param {Object} item - Book metadata
 * @returns {Promise<void>}
 */
async function saveBookMetadata(item) {
    if (!tableName) {
        throw new Error("DYNAMODB_TABLE_NAME is not configured");
    }

    await docClient.send(
        new PutCommand({
            TableName: tableName,
            Item: item,
        })
    );
}

/**
 * Get all books from DynamoDB
 * @returns {Promise<Array>} Array of book records
 */
async function getAllBooks() {
    if (!tableName) {
        throw new Error("DYNAMODB_TABLE_NAME is not configured");
    }

    const result = await docClient.send(
        new ScanCommand({
            TableName: tableName,
        })
    );

    return result.Items || [];
}

/**
 * Upload book files to S3 and metadata to DynamoDB
 * @param {Object} params
 * @param {Buffer} params.pdfBuffer - PDF file buffer
 * @param {string} params.pdfOriginalName - Original PDF filename
 * @param {Buffer} params.thumbnailBuffer - Thumbnail image buffer
 * @param {string} params.thumbnailOriginalName - Original thumbnail filename
 * @param {Object} params.metadata - { title, description, author, publish_date, isbn }
 * @returns {Promise<{ key: string }>}
 */
async function uploadBook({ pdfBuffer, pdfOriginalName, thumbnailBuffer, thumbnailOriginalName, metadata }) {
    const id = uuidv4();
    const timestamp = Date.now();
    const pdfExt = pdfOriginalName.endsWith(".pdf") ? "" : ".pdf";
    const pdfKey = `books/${id}/${timestamp}-${pdfOriginalName.replace(/\.pdf$/i, "")}${pdfExt}`;
    const thumbExt = thumbnailOriginalName.includes(".") ? thumbnailOriginalName.split(".").pop() : "jpg";
    const thumbKey = `books/${id}/${timestamp}-thumb.${thumbExt}`;

    await uploadToS3(pdfBuffer, pdfKey, "application/pdf");
    await uploadToS3(thumbnailBuffer, thumbKey, `image/${thumbExt === "jpg" ? "jpeg" : thumbExt}`);

    const item = {
        id,
        key: id,
        title: metadata.title,
        description: metadata.description,
        author: metadata.author,
        publish_date: metadata.publish_date || metadata.publishDate,
        isbn: metadata.isbn,
        pdf_key: pdfKey,
        thumbnail_key: thumbKey,
        created_at: new Date().toISOString(),
    };

    await saveBookMetadata(item);

    return { key: id };
}

/**
 * Get all books with presigned URLs for PDF and thumbnail
 * @param {number} urlExpiry - Presigned URL expiry in seconds (default 3600)
 * @returns {Promise<Array>} Books with pdf_url and thumbnail_url
 */
async function getBooksWithUrls(urlExpiry = 3600) {
    const books = await getAllBooks();

    const withUrls = await Promise.all(
        books.map(async (book) => {
            if (!book.pdf_key || !book.thumbnail_key) {
                return { ...book, pdf_url: "", thumbnail_url: "" };
            }
            const [pdf_url, thumbnail_url] = await Promise.all([
                getPresignedUrl(book.pdf_key, urlExpiry),
                getPresignedUrl(book.thumbnail_key, urlExpiry),
            ]);
            return { ...book, pdf_url, thumbnail_url };
        })
    );

    return withUrls;
}

/**
 * Delete a book from S3 and DynamoDB
 * @param {string} id - Book id (partition key)
 * @returns {Promise<{ deleted: boolean }>}
 */
async function deleteBook(id) {
    if (!id) {
        throw new Error("Book id is required");
    }

    const book = await docClient.send(
        new GetCommand({
            TableName: tableName,
            Key: { id },
        })
    );

    if (!book.Item) {
        throw new Error("Book not found");
    }

    const { pdf_key, thumbnail_key } = book.Item;

    if (pdf_key) {
        await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: pdf_key })
        );
    }
    if (thumbnail_key) {
        await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: thumbnail_key })
        );
    }

    await docClient.send(
        new DeleteCommand({
            TableName: tableName,
            Key: { id },
        })
    );

    return { deleted: true };
}

module.exports = {
    ensureBucketExists,
    ensureTableExists,
    uploadToS3,
    getPresignedUrl,
    saveBookMetadata,
    getAllBooks,
    uploadBook,
    getBooksWithUrls,
    deleteBook,
};
