const pg = require('pg');
const {Pool}=pg;
const pool = new Pool({
      host:'localhost',
    user:'postgres',
    password:'password',
    database:'llm_docs',
    port:5432

})
async function initializeDatabase(){
    try {
        
        await pool.query(`CREATE EXTENSION IF NOT EXISTS vector`);
        console.log("PG Vector extension ensured.");

        await pool.query(`CREATE TABLE IF NOT EXISTS documents(
            id SERIAL PRIMARY KEY,
            chunk TEXT NOT NULL,
            response TEXT,
            embedding VECTOR(768),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)

        //3.using HNSW Index(works better for RAG use cases)
await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_embedding_hnsw 
  ON documents USING hnsw (embedding vector_cosine_ops) 
  WITH (m=16, ef_construction=200)
`);

        console.log("Documents table ensured.");


    } catch (error) {
   
        console.error("❌ Error setting up database:", error);
        
    }
}
async function saveEmbeddings(chunk,embedding,response=null){
    try {
        const vectorString = JSON.stringify(embedding);
        const query = `INSERT INTO documents(chunk,embedding,response) VALUES($1,$2,$3) returning id`;
        const result = await pool.query(query,[chunk,vectorString,response]);
        return result.rows[0].id;
        
    } catch (error) {
        console.error("❌ Error saving embeddings:", error);
        
    }
}
async function findSimilarDocuments(embedding,limit=5){
    try {
        const vectorString = JSON.stringify(embedding);
        const query = `
        SELECT id, chunk, response, 1 - (embedding <=> $1) AS similarity
            FROM documents
            ORDER BY embedding <=> $1
            LIMIT $2
        `;
        const result = await pool.query(query,[vectorString,limit]);
        return result.rows;
        
    } catch (error) {
        console.error("❌ Error retrieving documents:", error.message);
        
    }
}




module.exports = {initializeDatabase,saveEmbeddings,pool,findSimilarDocuments};