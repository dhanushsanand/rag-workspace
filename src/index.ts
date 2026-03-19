import express from "express";
import {Document, DocumentVersion, SearchResult, Conversation} from "./types/types"
const app = express();
app.use(express.json());

const documents = new Map<string, Document>();
const documentHistory = new Map<string, DocumentVersion[]>();
const conversations = new Map<string, Conversation>();

let documentIdCounter = 1;
let conversationIdCounter = 1;
let messageCounter = 1

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Implement the required API here.
function createDocument(data:{title:string, content:string, tags?:string[]}):Document{
  const date = new Date().toISOString();
  const newDocument:Document = {id:String(documentIdCounter++),
    title:data.title,
    content:data.content,
    tags:data.tags || [],
    version:1,
    createdAt:date,
    updatedAt:date
  };
  return newDocument;
}

app.post("/api/documents", (req, res)=>{
  const {title, content, tags} = req.body;
  if(!title || title.trim() == "" || !content) return res.status(400).json({
    error:"Title or Content missing from request Body"
  });

  if(tags){
    for(let i = 0; i<tags.length;i++){
      if(tags[i].trim().length == 0){
        return res.status(400).json({
      error:"Empty Tag cannot be sent"
    });
      }
    }
  }

  const document = createDocument({title, content, tags});
  documents.set(document.id, document);
  const docHistory:DocumentVersion = {
    version:document.version,
    title,
    content,
    tags,
    updatedAt:document.updatedAt
  };
  documentHistory.set(document.id, [docHistory]);
  return res.status(201).json(document);
});

app.get("/api/documents/:id", (req, res)=>{
  const documentId = req.params.id;
  const document = documents.get(documentId);
  if(!document) return res.status(404).json({
    error:"Document not found"
  });
  return res.status(200).json(document);
});

app.get("/api/documents/:id/history", (req, res)=>{
  const documentId = req.params.id;
  const document = documents.get(documentId);
  if(!document) return res.status(404).json({
    error:"Document not found"
  });
  const history = documentHistory.get(documentId);
  if(history){
    history.sort((a, b)=>{
      return a.version - b.version
    });
  }
  return res.status(200).json({versions:history});
});

app.put("/api/documents/:id", (req, res)=>{
  const documentId = req.params.id;
  const {title, content, tags} = req.body;
  const document = documents.get(documentId);
  if(!document) return res.status(404).json({error:"Document not found"});
  if(!title || title.trim() == "" || !content) return res.status(400).json({
    error:"Title or Content missing from request Body"
  });

  if(tags){
    for(let i = 0; i<tags.length;i++){
      if(tags[i].trim().length == 0){
        return res.status(400).json({
      error:"Empty Tag cannot be sent"
    });
      }
    }
  }

  const updatedDocument:Document  ={
    id:document.id,
    title:title,
    version:document.version + 1,
    content:content,
    createdAt:document.createdAt,
    updatedAt:new Date().toISOString(),
    tags:tags
  }
  
  const docHistory:DocumentVersion = {
    title:updatedDocument.title,
    content:updatedDocument.content,
    tags:updatedDocument.tags,
    updatedAt:updatedDocument.updatedAt,
    version:updatedDocument.version
  };

  documents.set(documentId, updatedDocument);
  const history = documentHistory.get(documentId);
  if(history){
    history.push(docHistory);
    documentHistory.set(documentId, history);
  }
  return res.status(200).json(updatedDocument);
});

function tokenize(query:string):string[]{
  query = query.toLowerCase();
  const arr = query.match(/[a-z0-9]+/g);
  return arr || [];
}

function tokenizeQuery(query:string): string[]{
  const arr = tokenize(query);
  const setOfTokens = new Set<string>();
  let deduplicatedArray = new Array();
  arr.forEach(token=>{
    if(!setOfTokens.has(token)){
      deduplicatedArray.push(token);
      setOfTokens.add(token);
    }
  });
  return deduplicatedArray;
}

function calculateScore(document:Document, tokens:string[], query:string):number{
  const titleTokens = tokenize(document.title);
  const contentTokens = tokenize(document.content);
  const titleTokenHits = titleTokens.filter(token=>{tokens.includes(token)}).length;
  const contentTokenHits = contentTokens.filter(token=> tokens.includes(token)).length;
  let titleSubstringBonus = 0;
  if(document.title.toLowerCase().includes(query)) titleSubstringBonus = 2;
  let contentSubstringBonus = 0;
  if(document.content.toLowerCase().includes(query)) contentSubstringBonus = 5;
  return titleTokenHits * 3 + contentTokenHits + titleSubstringBonus + contentSubstringBonus;
}

app.post("/api/search", (req, res)=>{
  const {query, topK, tag} = req.body;
});

app.post("/api/answers", (req, res)=>{
  const {query, topK, tag} = req.body;
});

app.post("/api/conversations", (req, res)=>{
  const { name } = req.body;

});

app.post("/api/conversation/:id/messages", (req, res)=>{
  const {query, topK, tag} = req.body;
});

app.get("/api/conversations/:id", (req, res)=>{
  const conversationId = req.params.id;
});



app.listen(3000, () => {
  console.log("Server running on port 3000");
});
