const asyncHandler = require("express-async-handler");
const { Configuration, OpenAIApi } = require("openai");
const Session = require("../../Model/sessionModel");

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
  } = userPrompt;
  const sessionExists = await Session.findOne({ sessionId });
  if (!sessionExists) {
    res.status(422).json({
      error: "session doesn't exists",
    });
    throw new Error("Session doesn't  exists");
  }

  // get the session's message array length
  const serial = sessionExists.messages.length + 1;

  // push the user's prompt to the session's message array

  const incomingData = await Session.findOneAndUpdate(
    { sessionId },
    {
      $push: {
        messages: {
          type: "incoming",
          message: question,
          serial,
        },
      },
    }
  );

  // generate the response

  const response = await openai.createCompletion({
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
  });

  console.log(response.data.choices, "response");

  // push the response to the session's message array

  const generatedData = await Session.findOneAndUpdate(
    { sessionId },
    {
      $push: {
        messages: {
          type: "outgoing",
          message: response.data.choices[0].text,
          serial: serial + 1,
        },
      },
    }
  );

  // send the response to the user

  res.status(200).json([
    {
      type: "incoming",
      message: question,
      serial,
    },
    {
      type: "outgoing",
      message: response.data.choices[0].text,
      serial: serial + 1,
    },
  ]);
});

module.exports = {
  generateResponse,
};
