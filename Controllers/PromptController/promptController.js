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
          type: "outgoing",
          message: question,
          serial,
          sessionId: sessionId,
        },
      },
    }
  );

  // generate the response

  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo",

    prompt: `
      Subject: ${subjectSelection} ,
      Prompt: ${question},
      Assistance Level: ${assistanceLevel},
      Additional Details: ${additionalInstruction},

      focus on responding to Prompt!!
      
      Act as a teaching professional and analyze the question or topic and generate a comprehensive response to assist.
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
          type: "incoming",
          message: response.data.choices[0].text,
          serial: serial + 1,
          sessionId: sessionId,
        },
      },
    }
  );

  // send the response to the user

  res.status(200).json([
    {
      type: "outgoing",
      message: question,
      serial,
      sessionId: sessionId,
    },
    {
      type: "incoming",
      message: response.data.choices[0].text,
      serial: serial + 1,
      sessionId: sessionId,
    },
  ]);
});

module.exports = {
  generateResponse,
};
