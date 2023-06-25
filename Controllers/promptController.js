const OpenAiStream = require("./openAiStream");
const asyncHandler = require("express-async-handler");
const { Configuration, OpenAIApi } = require("openai");
// const database = require("./database"); // Assuming you have a separate module for database operations

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateResponse = asyncHandler(async (req, res) => {
  const userPrompt = req.body;
  const {
    subjectSelection,
    question,
    sessionId,
    additionalInstruction,
    assistanceLevel,
    uid,
  } = userPrompt;

  const responseStream = await OpenAiStream({
    model: "text-davinci-003",
    prompt: `
      Subject: ${subjectSelection} ,
      Topic or Question: ${question},
      Assistance Level: ${assistanceLevel},
      Additional Details: ${additionalInstruction},
      
      Act as a teaching professional and analyze the question or topic and generate a comprehensive response to assist. Please explain the concept and offer step-by-step guidance.
      `,
    temperature: 0.1,
    max_tokens: 600,
    stream: true,
  });

  const chunks = [];
  const reader = responseStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);

    // Process and save the chunk to the database
    const chunkText = new TextDecoder().decode(value);
    console.log(chunkText);
    // await database.saveChunk(chunkText);
    // Assuming you have a function in the "database" module to save the chunk
  }

  // Send each chunk to the frontend using Server-Sent Events
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  chunks.forEach((chunk, index) => {
    const chunkText = new TextDecoder().decode(chunk);
    res.write(`data: ${chunkText}\n\n`);

    // Simulate a delay between sending chunks (adjust the delay as needed)
    setTimeout(() => {
      if (index === chunks.length - 1) {
        res.write("event: end\n\n"); // Signal the end of the stream
      }
    }, index * 100); // Delay each chunk by 1 second
  });

  res.end();
});

module.exports = {
  generateResponse,
};
