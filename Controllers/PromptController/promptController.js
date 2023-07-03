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
        content: `focus on responding to latest content!! Act as a teaching professional and analyze the question or topic and generate a comprehensive response to assist. Not mandatorily, if possible or necessary or required, provide additional resources to assist the student. (Links, youtube videos, wikipedia reference etc.) ${
          serial < 3
            ? "most importantly, give a suitable title named Title: at the beginning of response."
            : ""
        }`,
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
    max_tokens: 800,
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  console.log(response.data.choices[0].message.content, "response");
  console.log("Token usage:", response.data.usage);
  const totalCost =
    response.data.usage.prompt_tokens * 0.0015 +
    response.data.usage.completion_tokens * 0.002;

  // Extract the title from the response
  let title = "";
  const responseContent = response.data.choices[0].message.content;
  const titleMatch = responseContent.match(/Title: ([^\n]+)/);
  if (titleMatch) {
    title = titleMatch[1];
  }

  console.log(title, "title");

  // if serial is less than 3, then set the title to Session model's sessionTitle

  if (serial < 3 && title !== "") {
    const sessionTitle = await Session.findOneAndUpdate(
      { sessionId },
      {
        sessionTitle: title,
      }
    );
  }

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
      //if serial is greater than 3, then send the title
      ...(serial < 3 && { title }),
    },
    {
      type: "incoming",
      message: response.data.choices[0].message.content,
      serial: serial + 1,
      sessionId: sessionId,
      tokenUsage: response.data.usage.completion_tokens,
      ...(serial < 3 && { title }),
    },
  ]);
});

module.exports = {
  generateResponse,
};
