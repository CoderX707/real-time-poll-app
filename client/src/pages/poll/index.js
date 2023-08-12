import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("/poll");

export default function Poll() {
  const pollId = window.location.pathname.replace("/", "");
  const [selectedOption, setSelectedOption] = useState("");
  const [isVoteDone, setIsVoteDone] = useState(false);
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    socket.emit("findPoll", pollId);
    socket.on("getPoll", (poll) => {
      if (poll) {
        setPoll(poll);
      }
    });
  }, [pollId]);

  const votePoll = (e) => {
    e.preventDefault();
    setIsVoteDone(true);
    socket.emit("vote", pollId, selectedOption);
  };

  return (
    <>
      <div className="mt-5 mx-auto w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
        {!poll && <h1 className="text-2xl mb-3">Poll Not found</h1>}
        <h1 className="text-2xl mb-3">{poll && poll.question}</h1>
        {poll && poll.options.map((ele, index) => (
          <div
            key={index}
            className="mb-3 flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700"
          >
            <input
              id="bordered-radio-1"
              type="radio"
              value={ele}
              name="bordered-radio"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              onChange={() => setSelectedOption(ele)}
            />
            <label
              htmlFor="bordered-radio-1"
              className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {ele}
            </label>
          </div>
        ))}

        <button
          type="button"
          disabled={isVoteDone}
          onClick={poll && votePoll}
          className="mt-3 w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Vote
        </button>
      </div>
    </>
  );
}
