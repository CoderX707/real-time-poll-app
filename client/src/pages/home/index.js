import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";

const socket = io("/poll");

export default function Home() {
  const [options, setOptions] = useState([""]);
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    socket.on("newPoll", handleNewPoll);
    socket.on("updateResults", handleUpdateResults);

    return () => {
      socket.off("newPoll", handleNewPoll);
      socket.off("updateResults", handleUpdateResults);
    };
  }, []);

  const handleNewPoll = (pollId, pollQuestion, options) => {
    console.count("new poll");
    setPolls((prevPolls) => [
      ...prevPolls,
      { id: pollId, question: pollQuestion, options: options },
    ]);
  };

  const handleUpdateResults = (pollId, results) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId ? { ...poll, results: results } : poll
      )
    );
  };

  const createPoll = async (e) => {
    console.count("called");
    e.preventDefault();
      await socket.emit("createPoll", question, options);
      setOptions([""]);
      setQuestion("");
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
        <form className="space-y-6" onSubmit={createPoll}>
          <h5 className="text-xl font-medium text-gray-900 dark:text-white">
            Real-Time Poll App!
          </h5>
          <div>
            <label
              htmlFor="question"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Poll Question
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              type="text"
              name="question"
              id="question"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="ask anything"
              required
            />
          </div>

          {options.map((option, index) => (
            <div key={index} className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={option}
                placeholder={"Option " + index}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
                className="py-3 px-4 block w-full border-gray-200 shadow-sm rounded-l-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
              />
              <button
                type="button"
                onClick={(e) => removeOption(index)}
                className="inline-flex flex-shrink-0 justify-center items-center h-[2.875rem] w-[3.875rem] rounded-r-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, ""])}
            className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            Add Options
          </button>
          <hr />
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Create Poll
          </button>
        </form>
      </div>
      <div className="mt-5 mx-auto w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
        <ul className="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
          {polls &&
            polls.map((poll) => (
              <li key={poll.id} className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {poll.question}
                    </p>
                    <ul>
                      {poll.options.map((option) => (
                        <li
                          key={option}
                          className="text-sm text-gray-500 truncate dark:text-gray-400"
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Link
                  to={poll.id}
                  target="_blank"
                  className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Share for voting
                </Link>
                <p className="mt-3">Results:</p>
                <ul>
                  {poll &&
                    poll.results &&
                    Object.entries(poll.results).map(([option, count]) => (
                      <li key={option}>
                        {option}: Count {count}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}
