# Pustak Aura

## AWS Setup (S3 + DynamoDB)

Books and metadata are stored in AWS S3 and DynamoDB. Configure via environment variables:

1. Copy `.env.example` to `.env` and fill in your AWS credentials:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (default: us-east-1)
   - `S3_BUCKET_NAME`
   - `DYNAMODB_TABLE_NAME` (default: pustak-aura-books)

2. Create the S3 bucket (with private access; presigned URLs are used for reads).

3. Create the DynamoDB table:
   ```bash
   node scripts/create-dynamodb-table.js
   ```