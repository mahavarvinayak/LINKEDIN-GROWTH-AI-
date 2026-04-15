"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bookmark,
  Trash2,
  Copy,
  PenTool,
  Clock,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// --- Types ---
interface Draft {
  id: string;
  content: string;
  created_at: string;
  topic?: string;
}

export default function DraftsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "draft")
        .order("created_at", { ascending: false });

      setDrafts(data || []);
      setLoading(false);
    };

    fetchDrafts();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-[8px] w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-surface-container rounded-[12px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-2">Archive</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-4xl font-serif text-on-background">Saved Drafts</h1>
          {drafts.length > 0 && (
            <span className="text-[0.6875rem] font-bold font-mono text-on-surface-variant/50 uppercase tracking-wider">
              {drafts.length} document{drafts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {drafts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium p-16 text-center">
          <div className="w-16 h-16 bg-surface-2 rounded-[12px] flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-on-surface-variant/30" />
          </div>
          <h2 className="text-2xl font-serif text-on-background mb-3">No drafts yet.</h2>
          <p className="text-[0.9375rem] font-medium text-on-surface-variant mb-8 max-w-xs mx-auto leading-relaxed">
            Your saved drafts will appear here. Start by generating your first post.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] shadow-md hover:shadow-premium transition-all"
          >
            <PenTool className="w-4 h-4" /> Create Post
          </Link>
        </div>
      ) : (
        /* Drafts List */
        <div className="space-y-4">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              isCopied={copiedId === draft.id}
              onCopy={() => handleCopy(draft.id, draft.content)}
              onDelete={() => handleDelete(draft.id)}
            />
          ))}

          <div className="pt-4 text-center">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-bold text-primary hover:underline underline-offset-4 uppercase tracking-[0.05em] font-mono"
            >
              Generate another post <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function DraftCard({
  draft,
  isCopied,
  onCopy,
  onDelete,
}: {
  draft: Draft;
  isCopied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = draft.content.slice(0, 220);
  const isLong = draft.content.length > 220;

  return (
    <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium hover:ring-primary/15 transition-all overflow-hidden group">
      {/* Card Header */}
      <div className="flex items-center justify-between px-7 py-4 border-b border-[rgba(229,226,218,0.3)]">
        <div className="flex items-center gap-2 text-on-surface-variant/50">
          <Bookmark className="w-3.5 h-3.5" />
          <span className="text-[0.5625rem] font-bold uppercase tracking-widest font-mono">Draft</span>
        </div>
        <div className="flex items-center gap-2 text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-5">
        <p
          className="text-[0.9375rem] font-mono text-on-background leading-[1.8] whitespace-pre-wrap cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded || !isLong ? draft.content : `${preview}…`}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-[0.6875rem] font-bold text-primary/70 hover:text-primary font-mono uppercase tracking-widest transition-colors"
          >
            {expanded ? "Collapse ↑" : "Expand ↓"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-7 py-4 border-t border-[rgba(229,226,218,0.3)]">
        <button
          onClick={onCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[0.75rem] font-bold uppercase tracking-wider font-mono transition-all ${
            isCopied
              ? "bg-secondary/10 text-secondary ring-1 ring-secondary/20"
              : "bg-surface-2 text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary"
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          {isCopied ? "Copied ✓" : "Copy"}
        </button>

        <Link
          href="/dashboard/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-surface-2 text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary rounded-[6px] text-[0.75rem] font-bold uppercase tracking-wider font-mono transition-all"
        >
          <PenTool className="w-3.5 h-3.5" /> Edit
        </Link>

        <button
          onClick={onDelete}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-surface-2 text-on-surface-variant/40 ring-1 ring-[rgba(229,226,218,0.3)] hover:bg-error/5 hover:text-error hover:ring-error/20 rounded-[6px] text-[0.75rem] font-bold uppercase tracking-wider font-mono transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
