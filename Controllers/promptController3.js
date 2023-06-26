const OpenAiStream = require("./openAiStream");
const { Configuration } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateResponse3 = async (req, res) => {
  const {
    subjectSelection,
    question,
    sessionId,
    additionalInstruction,
    assistanceLevel,
    uid,
  } = req.body;

  const responseStream = await OpenAiStream({
    model: "text-davinci-003",
    prompt: `
      Subject: ${subjectSelection},
      Topic or Question: ${question},
      Assistance Level: ${assistanceLevel},
      Additional Details: ${additionalInstruction},
      
      Act as a teaching professional and analyze the question or topic and generate a comprehensive response to assist. Please explain the concept and offer step-by-step guidance.
      `,
    temperature: 0.1,
    max_tokens: 600,
    stream: true,
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const reader = responseStream.getReader();

  const sendChunk = async () => {
    const { done, value } = await reader.read();
    if (done) {
      res.write("event: end\n\n"); // Signal the end of the stream
      res.end();
      return;
    }

    const chunkText = new TextDecoder().decode(value);
    res.write(`data: ${chunkText}\n\n`);

    // Continue sending the next chunk
    sendChunk();
  };

  // Start sending the chunks
  sendChunk();
};

module.exports = { generateResponse3 };
