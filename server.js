const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { v4: uuid } = require("uuid");
const cors = require("cors");

const app = express();

// cors used for dev
app.use(cors({
  origin: 'http://localhost:3000',
}));

const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + "/client/build"));
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/client/build/index.html");
});

const activePolls = {};

const pollNamespace = io.of("/poll");
pollNamespace.on("connection", (socket) => {
  console.log("A user connected to poll ");


  socket.on("createPoll", (pollQuestion, options) => {
    const pollId = uuid();
    activePolls[pollId] = {
      question: pollQuestion,
      options: options,
      votes: {},
    };
    pollNamespace.emit("newPoll", pollId, pollQuestion, options);
  });

  socket.on("findPoll", (pollId) => {
   if(!activePolls[pollId]) return;
    pollNamespace.emit("getPoll", activePolls[pollId]);
  });

  socket.on("vote", (pollId, selectedOption) => {
    if (!activePolls[pollId]) return;

    const userId = socket.id;
    activePolls[pollId].votes[userId] = selectedOption;
    pollNamespace.emit(
      "updateResults",
      pollId,
      calculateResults(activePolls[pollId])
    );
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected from poll");
  });
});

function calculateResults(pollData) {
  const results = {};
  Object.values(pollData.votes).forEach(selectedOption => {
    if (results[selectedOption]) {
      results[selectedOption]++;
    } else {
      results[selectedOption] = 1;
    }
  });
  return results;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
