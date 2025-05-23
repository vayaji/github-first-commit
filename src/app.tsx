import { useState } from "preact/hooks";
import { useReward } from "react-rewards";

export function App() {
  const [url, setUrl] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [firstCommitUrl, setFirstCommitUrl] = useState<string>("");
  const { reward } = useReward("rewardId", "confetti");
  const [buttonText, setButtonText] = useState<string>("Get first commit!");
  const [isSuccess, setIsSuccess] = useState(false);

  const appendLog = (log: string) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  const handleSubmit = async () => {
    if (firstCommitUrl) {
      window.location.href = firstCommitUrl;
      return;
    }
    const urlMatch =
      /github\.com\/(?<owner>[^\/]+)\/(?<name>[^\/]+)(?:\/tree\/(?<tree>[^\/]+))?/.exec(
        url,
      );
    const owner = urlMatch?.groups?.owner;
    const name = urlMatch?.groups?.name;
    const tree = urlMatch?.groups?.tree || "";
    if (!owner || !name) {
      appendLog("Invalid URL");
      return;
    }
    const apiUrl = `https://api.github.com/repos/${owner}/${name}/commits?sha1=${tree}`;
    appendLog(`Fetching ${apiUrl}`);
    const response = await fetch(apiUrl);

    let data = await response.json();
    const linkHeader = response.headers.get("link");
    if (linkHeader) {
      const linkHeaderMatch = /<(?<lastUrl>[^>]+)>; rel="last"/.exec(
        linkHeader,
      );
      const lastPage = linkHeaderMatch?.groups?.lastUrl;
      if (!lastPage) {
        appendLog("No last page");
        return;
      }
      const lastPageResponse = await fetch(lastPage);
      data = await lastPageResponse.json();
    }
    appendLog(`Fetched ${data.length} commits`);
    setFirstCommitUrl(data[data.length - 1].html_url);
    appendLog("Success!");
    reward();
    setIsSuccess(true);
    setButtonText("Go to first commit!");
    return;
  };

  return (
    <div
      className={
        "flex items-center justify-center h-screen flex-col gap-4 font-outfit"
      }
    >
      <input
        type="text"
        value={url}
        onInput={(e) => setUrl(e.currentTarget.value)}
        className={
          "p-4 border-2 border-slate-800 rounded-xl max-w-5/6 w-[800px] text-3xl text-center"
        }
      />
      <button
        type={"button"}
        className={`p-4 max-w-1/2 w-60 border-2 flex flex-col border-slate-800 rounded-xl text-center text-xl cursor-pointer transition-colors duration-500 ${isSuccess ? "bg-gradient-to-r from-[#f27121] via-[#e94057] to-[#8a2387] text-white" : ""}`}
        onClick={handleSubmit}
      >
        {buttonText}
        <span id="rewardId" />
      </button>
      <ol className={"flex flex-col text-center"}>
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ol>
    </div>
  );
}
