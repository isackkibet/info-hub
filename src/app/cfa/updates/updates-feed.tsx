"use client";

import { useState } from "react";
import {
  Card,
  Field,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/components/cfa/fields";
import { addUpdate, useCfaUpdates } from "@/lib/cfa-updates";
import { formatRelativeDate } from "@/lib/format-date";

export function UpdatesFeed() {
  const updates = useCfaUpdates();
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [showAll, setShowAll] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!authorName.trim() || !title.trim() || !body.trim()) {
      setError("Fill in your name, a title, and the update itself.");
      return;
    }
    addUpdate({
      authorName: authorName.trim(),
      title: title.trim(),
      body: body.trim(),
    });
    setTitle("");
    setBody("");
    setError(undefined);
  }

  const visible = showAll ? updates : updates.slice(0, 2);
  const more = updates.length - visible.length;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
      <Card title="Post an update">
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Field label="Your name" htmlFor="update-author">
            <TextInput
              id="update-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Chebet"
            />
          </Field>
          <Field label="Title" htmlFor="update-title">
            <TextInput
              id="update-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Community planting day this Saturday"
            />
          </Field>
          <Field label="Update" htmlFor="update-body">
            <TextArea
              id="update-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share what other members need to know"
            />
          </Field>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
          <PrimaryButton type="submit" className="w-full">
            Share with members
          </PrimaryButton>
        </form>
      </Card>

      <Card title="Recent updates">
        {visible.length === 0 ? (
          <p className="mt-4 text-sm text-ink-600">
            Nothing shared from this browser yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {visible.map((update) => (
              <li
                key={update.id}
                className="border-b border-sand-100 pb-4 last:border-none last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-ink-900">
                    {update.title}
                  </p>
                  <time
                    dateTime={update.createdAt}
                    className="shrink-0 text-xs text-ink-600"
                  >
                    {formatRelativeDate(update.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">
                  {update.body}
                </p>
                <p className="mt-1 text-xs text-ink-600">
                  Posted by {update.authorName}
                </p>
              </li>
            ))}
          </ul>
        )}
        {more > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-3 text-sm font-medium text-forest-700 hover:underline"
          >
            {more} more update{more === 1 ? "" : "s"}
          </button>
        )}
      </Card>
    </div>
  );
}
