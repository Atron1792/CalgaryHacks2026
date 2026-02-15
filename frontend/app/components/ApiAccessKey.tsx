"use client";

import { useEffect, useState } from "react";

/**
 * Props for the ApiAccessKey component.
 */
interface ApiAccessKeyProps {
  name: string;
  initialValue: string;
  storageKey?: string;
}

/**
 * ApiAccessKey Component
 * 
 * Displays a single editable API key with functionality to view, edit, and copy.
 * Keys are initially hidden for security and can be toggled to reveal the full value.
 */
export default function ApiAccessKey({
  name,
  initialValue,
  storageKey,
}: ApiAccessKeyProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    const savedValue = localStorage.getItem(storageKey);

    if (savedValue !== null) {
      setValue(savedValue);
    } else {
      localStorage.setItem(storageKey, initialValue);
    }
  }, [storageKey, initialValue]);

  /**
   * Copy the API key value to clipboard and show feedback.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  /**
   * Mask the API key value, showing only first and last 4 characters.
   */
  const maskKey = (keyValue: string): string => {
    if (keyValue.length <= 8) return "••••••••";
    return `${keyValue.slice(0, 4)}•••••••••${keyValue.slice(-4)}`;
  };

  const displayValue = isVisible ? value : maskKey(value);

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg"
      style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{name}</div>
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const nextValue = e.target.value;

              setValue(nextValue);

              if (storageKey) {
                localStorage.setItem(storageKey, nextValue);
                window.dispatchEvent(
                  new CustomEvent("api-key-updated", {
                    detail: { key: storageKey, value: nextValue },
                  })
                );
              }
            }}
            className="text-xs mt-2 w-full p-2 bg-slate-800 text-white rounded border border-slate-600 font-mono"
            placeholder="Enter API key"
          />
        ) : (
          <div className="text-xs text-zinc-500 mt-2 font-mono break-all">
            {displayValue}
          </div>
        )}
      </div>

      <div className="flex gap-2 ml-4 flex-shrink-0">
        {/* Toggle visibility button */}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-3 py-1 text-xs rounded bg-blue-900 hover:bg-blue-800 text-white transition-colors"
          aria-label={isVisible ? "Hide key" : "Show key"}
        >
          {isVisible ? "Hide" : "Show"}
        </button>

        {/* Edit button */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 text-xs rounded bg-purple-900 hover:bg-purple-800 text-white transition-colors"
          aria-label={isEditing ? "Done editing" : "Edit key"}
        >
          {isEditing ? "Done" : "Edit"}
        </button>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="px-3 py-1 text-xs rounded bg-green-900 hover:bg-green-800 text-white transition-colors"
          aria-label="Copy key"
        >
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
