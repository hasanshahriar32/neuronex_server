const asyncHandler = require("express-async-handler");
const Session = require("../Model/sessionModel");

// create a session so that the user can save their work
// do this before start generating prompt

const generateSession = asyncHandler(async (req, res) => {
  const userPrompt = req.body;
  const { sessionId, sessionTitle, uid } = userPrompt;
  const sessionExists = await Session.findOne({ sessionId });
  if (sessionExists) {
    res.status(422).json({
      error: "session already exists",
      sessionExists,
    });
    throw new Error("Session already exists");
  }
  const session = await Session.create({
    sessionId,
    sessionTitle,
    uid,
    isBookmarked: false,
    messages: [],
  });
  if (session) {
    res.status(201).json({
      _id: session._id,
      sessionId: session.sessionId,
      sessionTitle: session.sessionTitle,
      uid: session.uid,
      isBookmarked: session.isBookmarked,
      messages: session.messages,
    });
  } else {
    res.status(400);
    throw new Error("Invalid session data");
  }
});

// get all sessions
const allSession = asyncHandler(async (req, res) => {
  const sessionDetail = req.body;
  const page = sessionDetail?.page ? parseInt(sessionDetail?.page) : 1;
  const limit = sessionDetail?.limit ? parseInt(sessionDetail?.limit) : 50;
  const uid = sessionDetail?.uid;
  const skipIndex = (page - 1) * limit;
  const session = await Session.find({ uid })
    .skip(skipIndex)
    .limit(limit)
    .sort({ createdAt: -1 });
  // .select("-messages");
  res.send(session);
});

// get only the favorite sessions
const favoriteSession = asyncHandler(async (req, res) => {
  const sessionDetail = req.body;
  const page = sessionDetail?.page ? parseInt(sessionDetail?.page) : 1;
  const limit = sessionDetail?.limit ? parseInt(sessionDetail?.limit) : 50;
  const uid = sessionDetail?.uid;
  const skipIndex = (page - 1) * limit;
  const session = await Session.find({ uid, isBookmarked: true })
    .skip(skipIndex)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select("-messages");
  res.send(session);
});

// get a single session
const singleSession = asyncHandler(async (req, res) => {
  const sessionDetail = req.body;
  const sessionId = sessionDetail?.sessionId;

  const session = await Session.findOne({ sessionId });
  if (session) {
    res.status(201).send(session);
  } else {
    res.status(400);
    throw new Error("Invalid session data");
  }
});

// make  a session favorite
const makeFavorite = asyncHandler(async (req, res) => {
  const sessionDetail = req.body;
  const sessionId = sessionDetail?.sessionId;
  const uid = sessionDetail?.uid;
  const session = await Session.findOneAndUpdate(
    { sessionId, uid },
    { isBookmarked: true }
  );
  if (session) {
    res.status(201).send(session);
  } else {
    res.status(400);
    throw new Error("Invalid session data");
  }
});

module.exports = {
  generateSession,
  allSession,
  favoriteSession,
  singleSession,
  makeFavorite,
};
