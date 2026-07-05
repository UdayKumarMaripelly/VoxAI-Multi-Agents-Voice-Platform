import React from "react";
import Markdown from "react-markdown";

function SummeryBox({ summery }) {
  return (
    <section
      className="
        h-[60vh]
        overflow-y-auto
        rounded-xl
        border border-gray-200
        bg-gray-50
        px-6 py-5
      "
    >
      <article
        className="
          prose max-w-none
          prose-headings:font-semibold
          prose-h1:text-xl
          prose-h2:text-lg
          prose-h3:text-base
          prose-p:text-gray-700
          prose-p:leading-relaxed
          prose-li:text-gray-700
          prose-code:bg-gray-100
          prose-code:px-1.5
          prose-code:py-0.5
          prose-code:rounded
          text-sm
        "
      >
        {summery ? (
          <Markdown>{summery}</Markdown>
        ) : (
          <p className="text-gray-400 italic">
            No summary available yet.
          </p>
        )}
      </article>
    </section>
  );
}

export default SummeryBox;


