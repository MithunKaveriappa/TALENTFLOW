"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { Image as ImageIcon, Trash2, Edit3, X } from "lucide-react";
import Image from "next/image";

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
}

export default function CommunityFeed({ userRole }: { userRole: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFeed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);
      
      const data = await apiClient.get("/posts/feed", session.access_token);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const uploadedUrls: string[] = [];
      
      // Upload media if present
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community-media')
          .upload(filePath, file);
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('community-media')
            .getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
      }

      await apiClient.post("/posts", { 
        content: newPost,
        media_urls: uploadedUrls
      }, session.access_token);
      
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
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await apiClient.delete(`/posts/${postId}`, session.access_token);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await apiClient.patch(`/posts/${postId}`, { 
        content: editContent,
        media_urls: posts.find(p => p.id === postId)?.media_urls || []
      }, session.access_token);
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

    setMediaFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFollow = async (authorId: string, isFollowing: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (isFollowing) {
        await apiClient.delete(`/posts/unfollow/${authorId}`, session.access_token);
      } else {
        await apiClient.post("/posts/follow", { following_id: authorId }, session.access_token);
      }
      
      // Update local state
      setPosts(posts.map(p => 
        p.author.id === authorId ? { ...p, is_following: !isFollowing } : p
      ));
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Create Post */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Share a learning or update, ${userRole}...`}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-25 resize-none"
          />

          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pb-2">
              {mediaPreviews.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden h-24 bg-slate-100">
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Add Photo or Video"
              >
                <ImageIcon size={20} />
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
            
            <button
              disabled={isSubmitting || !newPost.trim()}
              className="bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              Post Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
            <p className="text-slate-400 font-medium">No signals detected in the community yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border border-slate-50 relative">
                    {post.author.profile_photo_url ? (
                      <Image src={post.author.profile_photo_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                        {post.author.full_name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{post.author.full_name || "Anonymous User"}</h3>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                        post.author.role === 'recruiter' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {post.author.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentUserId === post.user_id ? (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => startEditing(post)}
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Post"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleFollow(post.author.id, post.is_following)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all ${
                        post.is_following 
                          ? 'bg-slate-100 text-slate-500' 
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {post.is_following ? 'Following' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              {editingPost === post.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-20 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingPost(null)}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdatePost(post.id)}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              {post.media_urls.length > 0 && (
                <div className={`grid gap-2 mt-4 rounded-2xl overflow-hidden ${
                  post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}>
                  {post.media_urls.map((url, i) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video');
                    return isVideo ? (
                      <video key={i} src={url} controls className="w-full max-h-96 object-cover bg-slate-900" />
                    ) : (
                      <div key={i} className="relative w-full h-96">
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
