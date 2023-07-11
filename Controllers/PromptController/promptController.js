const asyncHandler = require("express-async-handler");
const { Configuration, OpenAIApi } = require("openai");
const Session = require("../../Model/sessionModel");
const Transaction = require("../../Model/transactionModel");
const Ai = require("../../Model/aiModel");
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
  const sessionExists = await Session.findOne({ sessionId });
  if (!sessionExists) {
    res.status(422).json({
      error: "session doesn't exists",
    });
    throw new Error("Session doesn't  exists");
    return;
  }

  // get the session's message array length
  const serial = sessionExists.messages.length + 1;
  const transaction = await Transaction.find({ uid }).select(
    "-dailyUsed -transactions"
  );
  const currentBalance = transaction[0]?.currentBalance;
  const validity = transaction[0]?.validity;
  if (currentBalance < 0.006 || !currentBalance) {
    res.status(403).json([
      {
        type: "outgoing",
        message: question,
        serial,
        sessionId: sessionId,
      },
      {
        type: "incoming",
        message: "Low balance! Upgrade Plan",
        serial: serial + 1,
        sessionId: sessionId,
      },
    ]);
    return;
  }
  if (currentBalance > 0.006) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set today's time to 00:00:00 UTC

    const newValidity = new Date(today.getTime());
    if (newValidity.getTime() > validity) {
      res.status(403).json([
        {
          type: "outgoing",
          message: question,
          serial,
          sessionId: sessionId,
        },
        {
          type: "incoming",
          message: "Expired balance! Recharge again",
          serial: serial + 1,
          sessionId: sessionId,
        },
      ]);
      return;
    }
  }
  // rate of the token
  const aiExists = await Ai.find();
  const aiReadCost = aiExists[0].inPrice;
  const aiWriteCost = aiExists[0].outPrice;

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
    (response.data.usage.prompt_tokens / 1000) * aiReadCost +
    (response.data.usage.completion_tokens / 1000) * aiWriteCost;
  console.log("Total Cost: " + " " + totalCost);

  // sessionExists.sessionCost;
  // update value of sessionCost
  // code here for daily cost

  sessionExists.sessionCost += totalCost;
  await sessionExists.save();
  transaction[0].currentBalance -= totalCost;
  await transaction[0].save();

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
      cost: (response.data.usage.prompt_tokens / 1000) * aiReadCost,
      //if serial is greater than 3, then send the title
      ...(serial < 3 && { title }),
    },
    {
      type: "incoming",
      message: response.data.choices[0].message.content,
      serial: serial + 1,
      sessionId: sessionId,
      tokenUsage: response.data.usage.completion_tokens,
      cost: (response.data.usage.completion_tokens / 1000) * aiWriteCost,
      ...(serial < 3 && { title }),
    },
  ]);
});

const generateSuggestions = asyncHandler(async (req, res) => {
  const { message, sessionId, uid } = req.body;

  if (!message) {
    res.status(400).json({
      error: "Message is required.",
    });
    return;
  }

  const transaction = await Transaction.find({ uid }).select(
    "-dailyUsed -transactions"
  );
  const currentBalance = transaction[0]?.currentBalance;
  const validity = transaction[0]?.validity;
  if (currentBalance < 0.006 || !currentBalance) {
    res.status(400).json({
      message: "How to upgrade plan?\n",
      sessionId,
      tokenUsage: 0,
      totalCost: 0,
    });
    return;
  }
  if (currentBalance > 0.006) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set today's time to 00:00:00 UTC

    const newValidity = new Date(today.getTime());
    if (newValidity.getTime() > validity) {
      res.status(400).json({
        message: "How to update validity?\n",
        sessionId,
        tokenUsage: 0,
        totalCost: 0,
      });
      return;
    }
  }

  // const formattedMessage = message.replace(/\n/g, "");

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Give some search suggestions based on the message in 5 lines. each line should be separated by a new line. and each line should be within 30 characters.`,
      },
      {
        role: "user",
        content: `
---------------message starts here---------------
${message}
---------------message ends here---------------`,
      },
    ],
    max_tokens: 200,
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  console.log(response.data.choices[0].message.content, "response");
  console.log("Token usage:", response.data.usage);

  // rate of the token
  const aiExists = await Ai.find();
  const aiReadCost = aiExists[0].inPrice;
  const aiWriteCost = aiExists[0].outPrice;

  const totalCost =
    (response.data.usage.prompt_tokens / 1000) * aiReadCost +
    (response.data.usage.completion_tokens / 1000) * aiWriteCost;
  console.log("Total Cost: " + " " + totalCost);

  // sessionExists.sessionCost;
  // update value of sessionCost
  // code here for daily cost
  const sessionExists = await Session.findOne({ sessionId });
  sessionExists.sessionCost += totalCost;
  await sessionExists.save();

  transaction[0].currentBalance -= totalCost;
  await transaction[0].save();

  res.status(200).json({
    message: response.data.choices[0].message.content,
    tokenUsage: response.data.usage.completion_tokens,
    totalCost,
    sessionId,
  });
});

module.exports = {
  generateResponse,
  generateSuggestions,
};
