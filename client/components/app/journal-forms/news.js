import React, { useState } from "react";
import BaseForm from "./base-form";
import Tooltip from "../tooltip";
import Pill from "../pill";


export default function News({ id, onSubmit }) {
    const [sentimentTypeId, setSentimentTypeId] = useState(1);
  const [newsURL, setNewsURL] = useState("");
  const [news, setNews] = useState("");

  function handlePillClick({id}) {
    setSentimentTypeId(id);
  }

  return (
    <BaseForm header="News Entry">
              <div>
        <label className="text-sm ml">News Sentiment*</label>
        <div className="flex flex-wrap">
            <Pill className="mr-2 mb-2" key={1} id={1} controlled onClick={handlePillClick} isActive={sentimentTypeId === 1} >Bullish</Pill>
            <Pill className="mr-2 mb-2" key={2} id={2} controlled onClick={handlePillClick} isActive={sentimentTypeId === 2} >Bearish</Pill>
        </div>
      </div>

<div className="mt-4">
              <label className="text-sm ml">URL</label>
              <div className="flex items-center">
                <input
                  type="url"
                  value={newsURL}
                  onChange={(e) => setNewsURL(e.target.value)}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The link to the web page where you found the news (optional)" />
              </div>
            </div>


      <div className="mt-4">
        <label className="text-sm ml">News*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" value={news} onChange={(e) => setNews(e.target.value)} />
        </div>
      </div>

    </BaseForm>
  );
}
