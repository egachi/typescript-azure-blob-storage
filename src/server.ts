import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import { ContainerClient, BlobServiceClient } from "@azure/storage-blob";

dotenv.config();

const port = process.env.PORT;
const app: Application = express();

app.use(express.urlencoded());
app.use(express.raw({type: '*/*',limit: '25mb'}));

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello World"});
});

app.put( "/upload", async (req: Request, res: Response) => {

    const containerName = "case-test";
    const content = req.body;

    let requestId = undefined;
    let name = undefined;

    let containerClient: ContainerClient | undefined;
    let blobServiceClient: BlobServiceClient | undefined;

    const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connString) throw Error('Azure Storage Connection string not found');

    blobServiceClient = BlobServiceClient.fromConnectionString(connString);
    containerClient = blobServiceClient.getContainerClient(containerName);

    try{
        const blobName = "image1.png";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
        requestId = uploadBlobResponse.requestId;
        name = blobName;
    }catch(error){
        console.log(error);
    }

    res.json({requestId, blobName: name});
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});