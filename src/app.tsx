import { useState } from "preact/hooks";

export function App() {
  const [url, setUrl] = useState("");

  return (
    <div className={"flex items-center justify-center h-screen"}>
      <input
        type="text"
        value={url}
        onInput={(e) => setUrl(e.currentTarget.value)}
        className={"p-4 border-2 border-slate-800 rounded-md w-1/2 text-3xl"}
      />
    </div>
  );
}
