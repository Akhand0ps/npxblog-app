import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../hooks/useAuth';
import type { Post, UpdatePostForm } from '../types';
import { Upload, X, Image as ImageIcon, Save, Trash2, AlertCircle } from 'lucide-react';

const EditPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<UpdatePostForm>({ title: '', content: '', tags: [], imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        const res = await api.getPost(slug);
        const p: Post | undefined = res.message || res.post || res.data;
        if (!p) throw new Error('Post not found');
        setPost(p);
        setFormData({
          title: p.title,
          content: p.content,
          tags: p.tags || [],
          imageUrl: p.imageUrl || '',
        });
      } catch (e) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const getAuthorId = (author: string | { _id?: string }) => (typeof author === 'object' ? (author as any)?._id : author);

  useEffect(() => {
    if (!loading && post) {
      const authorId = getAuthorId(post.author);
      if (!isAuthenticated || !user || !authorId || user._id !== authorId) {
        navigate(`/post/${post.slug}`, { replace: true });
      }
    }
  }, [loading, post, isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => setFormData(prev => ({ ...prev, imageUrl: '' }));

  const handleSave = async () => {
    if (!slug) return;
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Title and content are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.updatePost(slug, {
        title: formData.title!.trim(),
        content: formData.content!.trim(),
        tags: formData.tags,
        imageUrl: formData.imageUrl,
      });
      const updated: Post | undefined = res.newpost || res.post || res.message || res.data;
      const targetSlug = (updated && (updated as any).slug) || slug;
      navigate(`/post/${targetSlug}`, { replace: true });
    } catch (e: any) {
      setError(e?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug || !post) return;
    const confirm = window.confirm('Delete this post? This cannot be undone.');
    if (!confirm) return;
    try {
      await api.deletePost(slug);
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(e?.message || 'Failed to delete post');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!post) return <div className="p-8 text-center">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit post</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save size={16} /> Save changes
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Featured Image</label>
                <div className="flex flex-wrap items-center gap-4">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img src={formData.imageUrl} alt="Featured" className="w-full sm:w-40 h-44 sm:h-28 object-cover rounded-lg border shadow-sm" />
                      <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-40 h-44 sm:h-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-[220px]">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="edit-image-upload" />
                    <label htmlFor="edit-image-upload" className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer">
                      {uploadingImage ? 'Uploading…' : (<><Upload size={16} /> Choose Image</>)}
                    </label>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full text-3xl font-bold border-none outline-none placeholder-gray-300 focus:ring-0 bg-transparent"
                  maxLength={100}
                />
              </div>

              {/* Content */}
              <div>
                <textarea
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  placeholder="Write your content…"
                  className="w-full text-lg border-none outline-none resize-y placeholder-gray-300 focus:ring-0 bg-transparent leading-relaxed"
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;
