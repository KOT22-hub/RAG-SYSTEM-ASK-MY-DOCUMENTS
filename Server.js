const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const {split}= require('llm-splitter')
dotenv.config()
const {Ollama} = require('ollama')
const app = express()
const fileupload = require('express-fileupload')
const {initializeDatabase,saveEmbeddings,pool,findSimilarDocuments} = require('./database')

app.use(cors())
app.use(express.json())
app.use(fileupload())
const ollama = new Ollama({host:'http://127.0.0.1:11434'})
const port=process.env.PORT;

app.post('/api/upload-file',async (req,res)=>{
    try{
        if(!req.files){
            res.status(400).json({message:'No file uploaded'})
            return;
        }
        const uploadedfile = req.files.file;
        const textContent = uploadedfile.data.toString('utf-8').replace(/\s/g,' ').trim();
        const chunks =  split(textContent,{
            chunkSize:400,
            chunkOverlap:100
        })
        res.status(200).send(chunks)

        const batch = await ollama.embed({
            model:'nomic-embed-text',
            input:chunks.map((chunk)=>(chunk.text))
        })
      

        console.log(batch.embeddings[0].length);
        for(let i=0;i<chunks.length;i++){
            const chunk=chunks[i].text;
            const embedding = batch.embeddings[i];
           await saveEmbeddings(chunk,embedding);
            }

        res.json({message:"file processed and embeddings saved"})
       


    }
    catch(error){
        console.log(error)
    }
})
app.post('/api/chat',async(req,res)=>{
    try{
        const {prompt}=req.body;
        if(!prompt){
            res.status(400).json({message:'Prompt is required'}

            )
        }
        const embedResponse = await ollama.embed({
            model:'nomic-embed-text',
            input:prompt
        })
        const userEmbedding = embedResponse.embeddings[0];
        const similarDocs = await findSimilarDocuments(userEmbedding, 5);
console.log(`Found ${similarDocs.length} relevant context chunks.`);


// 1. Build a structured context string
const context = similarDocs.map((doc) => doc.chunk).join('\n---\n');
const sourceID = similarDocs.map((doc) => `doc: ${doc.id}`).join(', ');

// 2. Execute the chat with a clear structure
try {
    const chatResponse = await ollama.chat({
        model: 'gemma3:1b',
        messages: [
            {
                role: 'system', 
                content: `You are a helpful assistant. Use the following context to answer the user's question accurately. 
                          If the answer is not in the context, strictly say "I don't know based on the provided documents."
                          
                          CONTEXT:
                          ${context}`
            },
            {
                role: 'user', 
                content: prompt 
            }
        ],
        options: {
            temperature: 0 // Keep it low for factual Q&A to avoid "creative" lies
        }
    });
    res.json({ answer: chatResponse.message.content,sources: sourceID });

}
catch (chatError) {
    console.error("❌ Error during chat completion:", chatError);
    res.status(500).json({ message: "Error generating response" });
    return;
}


    }
    catch(error){
        console.log(error)
    }
})
app.listen(port, () => {
    initializeDatabase()
    console.log(`Server running on port ${port}`);
});



