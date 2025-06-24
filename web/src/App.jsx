import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setContext([...context, `${query}`]);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5002/lifetree-3c81e/us-central1/callMCP",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: `${context.join("\n")}\n${query}` }),
        }
      );

      const data = await response.json();
      const result = data?.result || JSON.stringify(data);
      setResult(result);
      setContext([...context, `${result}`]);
    } catch (err) {
      console.error("MCP request failed:", err);
      setResult("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <section>
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">What is your goal?</h1>

        {result && (
          <div className="mt-4 p-4 w-full bg-white text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto text-left">
            <div>{JSON.parse(result).output}</div>
          </div>
        )}
        <textarea
          className="w-full border rounded p-2 h-32"
          placeholder="Enter your goal"
          value={query}
          onChange={(e) => {
            setQuery(`${e.target.value}`);
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </section>
  );
}

export default App;
