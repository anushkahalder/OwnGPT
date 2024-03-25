// 


// import express from "express";
// import cors from "cors";
// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
// import { CSVLoader } from "langchain/document_loaders/fs/csv";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { OpenAI } from "@langchain/openai";
// import { RetrievalQAChain } from "langchain/chains";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { Tiktoken } from "@dqbd/tiktoken/lite";
// import { load } from "@dqbd/tiktoken/load";
// import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
// import models from "@dqbd/tiktoken/model_to_encoding.json" assert { type: "json" };
// import dotenv from "dotenv";
// dotenv.config();

// const port = 3000;
// const app = express();

// app.use(cors());
// app.use(express.json());

// const loader = new DirectoryLoader("./documents", {
//   ".csv": (path) => new CSVLoader(path),
//   ".pdf": (path) => new PDFLoader(path),
// });

// let vectorStore = null;

// async function loadDocs() {
//   console.log("Loading docs...");
//   const docs = await loader.load();
//   console.log("Docs loaded.");
//   return docs;
// }

// async function createVectorStore(docs) {
//   console.log("Creating vector store...");
//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//   });
//   const normalizedDocs = normalizeDocuments(docs);
//   const chunks = await textSplitter.createDocuments(normalizedDocs);
//   const embeddings = new OpenAIEmbeddings();
//   vectorStore = await FaissStore.fromDocuments(chunks, embeddings);
//   console.log("Vector store created.");
// }

// async function initialize() {
//   const docs = await loadDocs();
//   await createVectorStore(docs);
// }

// initialize();

// app.post("/send-prompt", async (req, res) => {
//   try {
//     const prompt = req.body.prompt;
//     console.log("Received prompt:", prompt);
//     if (!prompt) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Prompt is required" });
//     }

//     if (!vectorStore) {
//       return res.status(500).json({
//         success: false,
//         message: "Vector store is not initialized",
//       });
//     }

//     const response = await run(prompt);
//     console.log("Server response:", response);
//     res.json({ success: true, response });
//   } catch (error) {
//     console.error("Error in /send-prompt route:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

// async function run(prompt) {
//   try {
//     const model = new OpenAI({});
//     const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
//     console.log("Querying chain with prompt:", prompt);
//     const res = await chain.call({ query: prompt });
//     return res.text;
//   } catch (error) {
//     console.error("Error in run method:", error);
//     throw error; // Propagate error to caller
//   }
// }

// function normalizeDocuments(docs) {
//   return docs.map((doc) => {
//     if (typeof doc.pageContent === "string") {
//       return doc.pageContent;
//     } else if (Array.isArray(doc.pageContent)) {
//       return doc.pageContent.join("\n");
//     }
//   });
// }

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });




import express from "express";
import cors from "cors";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { Tiktoken } from "@dqbd/tiktoken/lite";
// import { load } from "@dqbd/tiktoken/load";
// import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
// import models from "@dqbd/tiktoken/model_to_encoding.json";
import multer from "multer";
const upload = multer({ dest: './documents' })
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

let vectorStore = null;
const documentsDirectory = './documents';


app.post("/upload-documents", upload.array('documents'), async (req, res) => {
  try {
    const files = req.files; // This will contain the uploaded files
    // Process the uploaded files
    for (const file of files) {
      const oldPath = file.path;
      const originalName = file.originalname;
      const extension = path.extname(originalName); // Get the file extension

      // Append the original file extension to the filename
      const newFilename = originalName;

      // Construct the new path with the appended extension
      const newPath = path.join(file.destination, newFilename);

      // Rename the file to include the extension
      fs.renameSync(oldPath, newPath);

      // Update the file object with the new filename and path
      file.filename = newFilename;
      file.path = newPath;
    }
    console.log("Received documents:", files);

    // Save the uploaded documents to the ./documents folder
    // await saveDocuments(documents);

    // Load the documents from the ./documents folder
    const loader = new DirectoryLoader("./documents", {
      ".pdf": (path) => new PDFLoader(path),
    });
    console.log("Loading docs...");
    const docs = await loader.load();
    console.log("Docs loaded.");

    // Create the vector store from the loaded documents
    await createVectorStore(docs);

    res.status(200).json({ success: true, message: "Documents uploaded successfully" });
  } catch (error) {
    console.error("Error in /upload-documents route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/send-prompt", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt);
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    if (!vectorStore) {
      return res.status(500).json({
        success: false,
        message: "Vector store is not initialized",
      });
    }

    const response = await run(prompt);
    console.log("Server response:", response);
    res.json({ success: true, response : JSON.stringify(response)});
  } catch (error) {
    console.error("Error in /send-prompt route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

async function createVectorStore(docs) {
  console.log("Creating vector store...");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  console.log("tesxt splitted");

  const normalizedDocs = normalizeDocuments(docs);
  console.log("docs normalised")
  const chunks = await textSplitter.createDocuments(normalizedDocs);
  console.log("chunks created")
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  });
  console.log("embeddings created")
  vectorStore = await FaissStore.fromDocuments(chunks, embeddings);
  console.log("Vector store created.");
}


async function run(prompt) {
  try {
    if (!vectorStore) {
      throw new Error("Vector store not initialised yet. Try calling fromTexts, fromDocuments or fromIndex first.");
    }
    const model = new OpenAI({});
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    console.log("Querying chain with prompt:", prompt);
    const res = await chain.call({ query: prompt });
    return res.text;
  } catch (error) {
    console.error("Error in run method:", error);
    throw error; // Propagate error to caller
  }
}

function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
