"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import {
  Trash2,
  Edit3,
  X,
  Video,
  Pin,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
  Radio,
  UserCheck,
  UserPlus,
  Zap,
  Camera,
} from "lucide-react";

interface Author {
  id: string;
  full_name: string;
  role: "candidate" | "recruiter";
  profile_photo_url?: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  type: string;
  created_at: string;
  author: Author;
  is_following: boolean;
  is_pinned: boolean;
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [activeTab, setActiveTab] = useState<"global" | "personal">("global");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pinnedPostIds, setPinnedPostIds] = useState<Set<string>>(new Set());

  const handlePinPost = async (postId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const isCurrentlyPinned = pinnedPostIds.has(postId);

    // Optimistic Update
    setPinnedPostIds((prev) => {
      const newPins = new Set(prev);
      if (isCurrentlyPinned) newPins.delete(postId);
      else newPins.add(postId);
      return newPins;
    });

    try {
      if (isCurrentlyPinned) {
        await apiClient.delete(`/posts/${postId}/unpin`, session.access_token);
      } else {
        await apiClient.post(`/posts/${postId}/pin`, {}, session.access_token);
      }
    } catch (err) {
      console.error("Failed to synchronize cloud pin:", err);
      // Rollback on error
      setPinnedPostIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyPinned) next.add(postId);
        else next.delete(postId);
        return next;
      });
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
    alert("Signal connection link copied to clipboard.");
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

      const data = await apiClient.get("/posts/feed", session.access_token);
      const feedPosts = data as Post[];
      setPosts(feedPosts);

      // Initialize pinned posts from server signal
      const pinned = new Set<string>();
      feedPosts.forEach((p) => {
        if (p.is_pinned) pinned.add(p.id);
      });
      setPinnedPostIds(pinned);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const filteredPosts =
    activeTab === "global"
      ? posts
      : posts.filter((p) => p.user_id === currentUserId);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const uploadedUrls: string[] = [];

      // Upload media if present
      for (const file of mediaFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        console.log(`Uploading file: ${filePath}`);

        const { error: uploadError } = await supabase.storage
          .from("community-media")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          alert(
            `Failed to upload ${file.name}. Please ensure the STORAGE BUCKET 'community-media' exists and is PUBLIC.`,
          );
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("community-media").getPublicUrl(filePath);

        console.log(`Uploaded URL: ${publicUrl}`);
        uploadedUrls.push(publicUrl);
      }

      await apiClient.post(
        "/posts",
        {
          content: newPost,
          media_urls: uploadedUrls,
        },
        session.access_token,
      );

      setNewPost("");
      setMediaFiles([]);
      setMediaPreviews([]);
      fetchFeed();
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Filter out deleted post from state immediately (Optimistic Update)
      setPosts(posts.filter((p) => p.id !== postId));
      setPinnedPostIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });

      await apiClient.delete(`/posts/${postId}`, session.access_token);
    } catch (err) {
      console.error("Error deleting post:", err);
      fetchFeed(); // Rollback if error
    }
  };

  const handleSaveEdit = async (postId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      await apiClient.patch(
        `/posts/${postId}`,
        {
          content: editContent,
          media_urls: posts.find((p) => p.id === postId)?.media_urls || [],
        },
        session.access_token,
      );
      setEditingPost(null);
      fetchFeed();
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const startEditing = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setMediaFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFollow = async (authorId: string, isFollowing: boolean) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      if (isFollowing) {
        await apiClient.delete(
          `/posts/unfollow/${authorId}`,
          session.access_token,
        );
      } else {
        await apiClient.post(
          "/posts/follow",
          { following_id: authorId },
          session.access_token,
        );
      }

      // Update local state
      setPosts(
        posts.map((p) =>
          p.author.id === authorId ? { ...p, is_following: !isFollowing } : p,
        ),
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  return (
    <div className="max-w-280 mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("global")}
            className={`text-sm font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${
              activeTab === "global"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Community Feed
            {activeTab === "global" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`text-sm font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${
              activeTab === "personal"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            My Posts
            {activeTab === "personal" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl">
          <div className="px-3 py-1.5 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-600" />
            <span className="text-3xs font-black uppercase text-slate-500 tracking-widest">
              Live Flow
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Main Feed Column - 65% width equivalent */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Create Post Box */}
          <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100/40 mb-8">
            <h2 className="text-3xs font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200" />
              Start a Conversation
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="relative">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share what's on your mind with the community..."
                  className="w-full bg-slate-50/50 border-none rounded-3xl p-6 text-base font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 min-h-30 resize-none transition-all focus:bg-white"
                />
                <div className="absolute top-4 left-4 text-indigo-400 opacity-20">
                  <Zap size={20} fill="currentColor" />
                </div>
              </div>

              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  {mediaPreviews.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm group"
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all group border border-slate-100"
                  >
                    <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                      <Camera size={12} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Photo
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all group border border-slate-100"
                  >
                    <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <Video size={12} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Video
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={isSubmitting || !newPost.trim()}
                    type="submit"
                    className="bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl text-3xs uppercase tracking-[0.2em] transition-all hover:bg-black shadow-lg shadow-slate-200 border border-slate-700 text-center flex items-center justify-center min-w-22.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "..." : "POST"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Feed Signals */}
          <div className="space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-3xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Synchronizing Signals
                </p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-slate-50/50 rounded-4xl p-16 text-center border-2 border-dashed border-slate-100">
                <Radio className="mx-auto text-slate-300 mb-4" size={32} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No activity detected here
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl p-0 border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all"
                >
                  {/* Post Header */}
                  <div className="p-8 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full ring-2 ring-slate-100 ring-offset-2 overflow-hidden bg-slate-50 relative border-2 border-white shadow-sm">
                          {post.author?.profile_photo_url ? (
                            <Image
                              src={post.author.profile_photo_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-black text-indigo-300 text-lg bg-indigo-50/50">
                              {post.author?.full_name?.[0] || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            {post.author?.full_name || "Anonymous Professional"}
                          </h3>
                          <div className="flex items-center gap-2 text-3xs font-bold text-slate-400">
                            <span className="uppercase tracking-widest text-indigo-500">
                              {post.author?.role === "recruiter"
                                ? "Project Manager"
                                : "Elite Talent"}
                            </span>
                            <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                            <span>
                              {new Date(post.created_at)
                                .toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                .replace(",", " • ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePinPost(post.id)}
                          className={`p-1.5 transition-all hover:scale-110 ${pinnedPostIds.has(post.id) ? "text-indigo-600" : "text-slate-300 hover:text-slate-900"}`}
                        >
                          <Pin
                            size={16}
                            className={
                              pinnedPostIds.has(post.id)
                                ? "fill-indigo-600"
                                : "rotate-45"
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-4xs font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-md border border-emerald-100">
                        <Radio size={12} />
                        Post Published
                      </div>

                      <div className="text-slate-600 text-sm font-medium leading-[1.6] whitespace-pre-wrap">
                        {editingPost === post.id ? (
                          <div className="space-y-4 py-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-32 resize-none font-bold text-slate-900"
                            />
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setEditingPost(null)}
                                className="text-2xs font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest px-4"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(post.id)}
                                className="bg-slate-900 text-white text-2xs font-black uppercase tracking-widest px-8 py-3 rounded-xl shadow-lg shadow-slate-200"
                              >
                                Seal Update
                              </button>
                            </div>
                          </div>
                        ) : (
                          post.content
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media Rendering */}
                  {post.media_urls &&
                    post.media_urls.length > 0 &&
                    !editingPost && (
                      <div className="px-6 sm:px-8 pb-6">
                        <div
                          className={`grid gap-2 rounded-2xl overflow-hidden border border-slate-100 ${post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                        >
                          {post.media_urls.map((url, i) => {
                            const isVideo =
                              /\.(mp4|webm|ogg)/i.test(url.split("?")[0]) ||
                              url.includes("video");
                            if (isVideo) {
                              return (
                                <video
                                  key={i}
                                  src={url}
                                  controls
                                  className="w-full h-full max-h-100 object-cover bg-slate-900 shadow-inner"
                                />
                              );
                            }
                            return (
                              <div
                                key={i}
                                className="relative aspect-video group cursor-zoom-in"
                              >
                                <Image
                                  src={url}
                                  alt="Post media"
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Interaction Bar */}
                  <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1 sm:gap-4">
                        <button className="flex items-center gap-2 px-3 py-2 hover:bg-white rounded-xl transition-all text-slate-500 group">
                          <Heart
                            size={16}
                            className="group-hover:text-rose-500 transition-colors"
                          />
                          <span className="text-3xs font-black uppercase tracking-widest leading-none">
                            Like
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 hover:bg-white rounded-xl transition-all text-slate-500 group">
                          <MessageSquare
                            size={16}
                            className="group-hover:text-indigo-600 transition-colors"
                          />
                          <span className="text-3xs font-black uppercase tracking-widest leading-none">
                            Comment
                          </span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-white rounded-xl transition-all text-slate-500 group"
                        >
                          <Share2
                            size={16}
                            className="group-hover:text-emerald-500 transition-colors"
                          />
                          <span className="text-3xs font-black uppercase tracking-widest leading-none">
                            Share
                          </span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 ml-auto">
                        {currentUserId !== post.user_id && (
                          <button
                            onClick={() =>
                              handleFollow(post.author.id, post.is_following)
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                              post.is_following
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-900 text-white border-slate-700 hover:bg-black shadow-md shadow-slate-200"
                            }`}
                          >
                            {post.is_following ? (
                              <UserCheck size={14} />
                            ) : (
                              <UserPlus size={14} />
                            )}
                            <span className="text-3xs font-black uppercase tracking-widest leading-none whitespace-nowrap">
                              {post.is_following ? "Connected" : "Connect"}
                            </span>
                          </button>
                        )}
                        {currentUserId === post.user_id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(post)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Edit Post"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete Post"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-3xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Pin size={14} className="text-indigo-600" />
              Pinned for You
            </h4>
            <span className="bg-indigo-50 text-indigo-600 text-3xs font-black px-2 py-0.5 rounded-full border border-indigo-100 italic">
              {posts.filter((p) => pinnedPostIds.has(p.id)).length} Saved
            </span>
          </div>

          <div className="space-y-6">
            {posts.filter((p) => pinnedPostIds.has(p.id)).length === 0 ? (
              <div className="bg-white rounded-4xl p-12 border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                  <Pin size={24} className="rotate-45" />
                </div>
                <p className="text-3xs font-black uppercase tracking-widest text-slate-400">
                  No signals pinned
                </p>
              </div>
            ) : (
              posts
                .filter((p) => pinnedPostIds.has(p.id))
                .map((post) => (
                  <div
                    key={`pinned-${post.id}`}
                    className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-500 group relative"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden relative border-2 border-slate-50 shadow-sm">
                            {post.author?.profile_photo_url ? (
                              <Image
                                src={post.author.profile_photo_url}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs font-black bg-indigo-50 text-indigo-400">
                                {post.author?.full_name?.[0] || "?"}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-2xs font-black text-slate-900 uppercase tracking-wider">
                              {post.author?.full_name || "Nexus Member"}
                            </span>
                            <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePinPost(post.id)}
                          className="p-1.5 text-indigo-600 hover:text-rose-500 transition-colors"
                          title="Unpin Signal"
                        >
                          <Pin size={16} className="fill-indigo-600" />
                        </button>
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-600 leading-relaxed line-clamp-3 italic">
                        &ldquo;{post.content}&rdquo;
                      </p>

                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 aspect-video relative">
                          <Image
                            src={post.media_urls[0]}
                            alt="Pinned preview"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {post.media_urls.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter backdrop-blur-sm">
                              +{post.media_urls.length - 1} More
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Decorative Pinned Ribbon */}
                    <div className="absolute top-0 right-12 h-6 w-12 bg-indigo-600/5 rounded-b-xl flex items-center justify-center">
                      <div className="h-1 w-4 bg-indigo-600/20 rounded-full" />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
