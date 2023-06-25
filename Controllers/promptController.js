const asyncHandler = require("express-async-handler");
const { Configuration, OpenAIApi } = require("openai");

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

  const response = await openai.createCompletion({
    model: "text-davinci-003",

    prompt: `
            Subject: ${subjectSelection} ,
            Topic or Question: ${question},
            Assistance Level: ${assistanceLevel},
            Additional Details: ${additionalInstruction},
            
            Act as a teaching professional and analyze the question or topic and generate a comprehensive response to assist. Please explain the concept, and offer step-by-step guidance.
            `,
    temperature: 0.1,
    max_tokens: 600,
  });

  console.log(response.data.choices, "response");

  res.send(response.data.choices);
});

module.exports = {
  generateResponse,
};
