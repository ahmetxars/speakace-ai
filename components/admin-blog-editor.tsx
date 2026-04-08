"use client";

import { useState } from "react";
import type { AdminCustomPostRecord } from "@/lib/types";

interface AdminBlogEditorProps {
  posts: AdminCustomPostRecord[];
}

export function AdminBlogEditor({ posts }: AdminBlogEditorProps) {
  const [selectedPost, setSelectedPost] = useState<AdminCustomPostRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    language: "en",
    title: "",
    description: "",
    intro: "",
    body: "",
    keywords: "",
    status: "draft" as "draft" | "published"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedPost(null);
    setFormData({
      slug: "",
      language: "en",
      title: "",
      description: "",
      intro: "",
      body: "",
      keywords: "",
      status: "draft"
    });
  };

  const handleSelectPost = (post: AdminCustomPostRecord) => {
    setIsCreating(false);
    setSelectedPost(post);
    setFormData({
      slug: post.slug,
      language: post.language,
      title: post.title,
      description: post.description,
      intro: "",
      body: "",
      keywords: post.keywords.join(", "),
      status: post.status
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const endpoint = isCreating ? "/api/admin/blog/create" : "/api/admin/blog/update";
      const method = isCreating ? "POST" : "PUT";
      const payload = isCreating
        ? {
            slug: formData.slug,
            language: formData.language,
            title: formData.title,
            description: formData.description,
            intro: formData.intro,
            body: formData.body,
            keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
            status: formData.status
          }
        : {
            id: selectedPost?.id,
            status: formData.status
          };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save blog post");
      }

      setMessage({ type: "success", text: isCreating ? "Blog post created!" : "Blog post updated!" });
      setIsCreating(false);
      setSelectedPost(null);
      setFormData({
        slug: "",
        language: "en",
        title: "",
        description: "",
        intro: "",
        body: "",
        keywords: "",
        status: "draft"
      });

      // Refresh the page to see updated posts
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/blog/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId })
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      setMessage({ type: "success", text: "Blog post deleted!" });
      setSelectedPost(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", padding: "2rem" }}>
      {/* Posts List */}
      <div>
        <h2>Blog Posts</h2>
        <button
          onClick={handleCreateNew}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          + New Post
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "600px", overflowY: "auto" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleSelectPost(post)}
              style={{
                padding: "1rem",
                backgroundColor: selectedPost?.id === post.id ? "var(--primary-light)" : "var(--card-bg)",
                border: `1px solid ${selectedPost?.id === post.id ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{post.title}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                {post.language.toUpperCase()} • {post.status}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                Updated: {new Date(post.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div>
        <h2>{isCreating ? "Create New Post" : selectedPost ? "Edit Post" : "Select a post to edit"}</h2>

        {message && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
              color: message.type === "success" ? "#155724" : "#721c24",
              borderRadius: "0.5rem"
            }}
          >
            {message.text}
          </div>
        )}

        {(isCreating || selectedPost) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {isCreating && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., how-to-improve-ielts"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem"
                    }}
                  >
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="nl">Dutch</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Intro</label>
                  <textarea
                    value={formData.intro}
                    onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      minHeight: "80px",
                      fontFamily: "monospace"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Body (Markdown)</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Use ## for section headings"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      minHeight: "200px",
                      fontFamily: "monospace"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="e.g., ielts, speaking, tips"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "1rem"
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "1rem"
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>

              {selectedPost && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedPost.id)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setSelectedPost(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "var(--border)",
                  color: "var(--text)",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
