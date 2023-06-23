const asyncHandler = require("express-async-handler");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateResponse = asyncHandler(async (req, res) => {
  //   const userPrompt = req.body;

  const response = await openai.createCompletion({
    model: "text-davinci-003",

    prompt: `
            Subject: Mathematics 
            Topic or Question: How to solve quadratic equations?
            Assistance Level: step-by-step guidance
            Additional Details: I am struggling with factoring quadratic equations. Can you provide some examples to practice?
            
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
