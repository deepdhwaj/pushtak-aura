/**
 * Creates the DynamoDB table for book metadata.
 * Run: node scripts/create-dynamodb-table.js
 * Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, DYNAMODB_TABLE_NAME
 */

require("dotenv").config();
const {
    DynamoDBClient,
    CreateTableCommand,
    DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

const tableName = process.env.DYNAMODB_TABLE_NAME || "pustak-aura-books";
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

async function createTable() {
    try {
        await client.send(
            new CreateTableCommand({
                TableName: tableName,
                AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
                KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
                BillingMode: "PAY_PER_REQUEST",
            })
        );
        console.log(`Table "${tableName}" created successfully.`);
    } catch (err) {
        if (err.name === "ResourceInUseException") {
            console.log(`Table "${tableName}" already exists.`);
        } else {
            throw err;
        }
    }
}

createTable().catch((e) => {
    console.error(e);
    process.exit(1);
});
