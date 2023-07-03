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

  // generate the response

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",

    messages: [
      {
        role: "system",
        content:
          "focus on responding to latest content!! Act as a teaching professional and analyze the question or topic and generate a comprehensive response to assist. Not mandatorily, if possible or necessary or required, provide additional resources to assist the student. (Links, youtube videos, wikipedia reference etc.)",
      },
      {
        role: "user",
        content: `
      Subject: ${subjectSelection} ,
      Prompt: ${question},
      Assistance Level: ${assistanceLevel},
      Additional Details: ${additionalInstruction}, 
      `,
      },
    ],
    max_tokens: 600,
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  console.log(response.data.choices[0].message.content, "response");
  console.log("Token usage:", response.data.usage);
  const totalCost =
    response.data.usage.prompt_tokens * 0.0015 +
    response.data.usage.completion_tokens * 0.002;

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
          tokenUsage: response.data.usage.prompt_tokens,
        },
      },
    }
  );

  // push the response to the session's message array

  const generatedData = await Session.findOneAndUpdate(
    { sessionId },
    {
      $push: {
        messages: {
          type: "incoming",
          message: response.data.choices[0].message.content,
          serial: serial + 1,
          sessionId: sessionId,
          tokenUsage: response.data.usage.completion_tokens,
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
      tokenUsage: response.data.usage.prompt_tokens,
    },
    {
      type: "incoming",
      message: response.data.choices[0].message.content,
      serial: serial + 1,
      sessionId: sessionId,
      tokenUsage: response.data.usage.completion_tokens,
    },
  ]);
});

module.exports = {
  generateResponse,
};
