import { useState } from "preact/hooks";

export function App() {
  const [url, setUrl] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [firstCommitUrl, setFirstCommitUrl] = useState<string>("");

  const appendLog = (log: string) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  const handleSubmit = async () => {
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
    const linkHeader = response.headers.get("link");
    if (!linkHeader) {
      const data = await response.json();
      appendLog(`Fetched ${data.length} commits`);
      setFirstCommitUrl(data[data.length - 1].html_url);
      appendLog("Success!");
      return;
    }

    const linkHeaderMatch = /<(?<lastUrl>[^>]+)>; rel="last"/.exec(linkHeader);
    const lastPage = linkHeaderMatch?.groups?.lastUrl;
    if (!lastPage) {
      appendLog("No last page");
      return;
    }
    const lastPageResponse = await fetch(lastPage);
    const lastPageData = await lastPageResponse.json();
    appendLog(`Fetched ${lastPageData.length} commits`);
    setFirstCommitUrl(lastPageData[lastPageData.length - 1].html_url);
    appendLog("Success!");
  };

  return (
    <div
      className={
        "flex items-center justify-center h-screen flex-col gap-4 font-outfit"
      }
    >
      <a href={firstCommitUrl}>
        <h1>GitHub First Commit</h1>
      </a>
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
        className={
          "p-4 max-w-1/2 w-60 border-2 border-slate-800 rounded-xl text-2xl cursor-pointer"
        }
        onClick={handleSubmit}
      >
        Submit
      </button>
      <ol className={"flex flex-col text-center"}>
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ol>
    </div>
  );
}
