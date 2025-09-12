import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, Save, Send, Tag, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';
import type { CreatePostForm } from '../types';

const WritePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePostForm>({
    title: '',
    content: '',
    tags: [],
    imageUrl: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content) {
        handleSaveDraft(true); // Silent save
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData.title, formData.content]);

  // Calculate stats when content changes
  useEffect(() => {
    const text = formData.content;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const estimatedReadTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute

    setWordCount(words);
    setCharCount(chars);
    setReadTime(estimatedReadTime);
  }, [formData.content]);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [formData.content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags?.includes(trimmedTag) && formData.tags!.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (10MB max for posts)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, imageUrl }));
      setSuccess('Image uploaded successfully!');
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Please add a title to your story');
      titleRef.current?.focus();
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Your story needs some content');
      contentRef.current?.focus();
      return;
    }

    if (formData.content.trim().length < 100) {
      setError('Your story should be at least 100 characters long');
      contentRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.createPost({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
      });
      
      if (response.message && response.post) {
        // Clear draft on successful publish
        localStorage.removeItem('draft-post');
        navigate(`/post/${response.post.slug}`, { replace: true });
      } else {
        setError('Failed to publish your story. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while publishing your story. Please try again.');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (silent: boolean = false) => {
    if (!formData.title.trim() && !formData.content.trim()) return;

    setSaving(true);
    
    try {
      // Save to localStorage for now (could be enhanced with backend API)
      const draftData = {
        ...formData,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('draft-post', JSON.stringify(draftData));
      
      if (!silent) {
        setSuccess('Draft saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      if (!silent) {
        setError('Failed to save draft');
      }
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft-post');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Write your story</h1>
                {saving && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    <span>Saving draft...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleSaveDraft()}
                  disabled={saving || (!formData.title.trim() && !formData.content.trim())}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <Save size={16} />
                  <span className="hidden sm:inline">Save Draft</span>
                  <span className="sm:hidden">Save</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || uploadingImage || !formData.title.trim() || !formData.content.trim()}
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span className="hidden sm:inline">Publish</span>
                      <span className="sm:hidden">Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start space-x-3 fade-in">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="font-medium">{success}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <ImageIcon className="inline w-4 h-4 mr-2" />
                  Featured Image
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {formData.imageUrl ? (
                    <div className="relative max-w-xs mx-auto sm:mx-0">
                      <img
                        src={formData.imageUrl}
                        alt="Featured image preview"
                        className="w-full h-48 sm:h-32 object-cover rounded-lg border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-40 h-48 sm:h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={loading || uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="spinner w-4 h-4"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Choose Image</span>
                        </>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Max 10MB • JPG, PNG, GIF supported
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <input
                  ref={titleRef}
                  type="text"
                  name="title"
                  placeholder="Tell your story..."
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 focus:ring-0 bg-transparent resize-none"
                  style={{ lineHeight: '1.2' }}
                  maxLength={100}
                  disabled={loading}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-400">
                    {formData.title.length}/100 characters
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <textarea
                  ref={contentRef}
                  name="content"
                  placeholder="Write your story here..."
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full text-lg border-none outline-none resize-none placeholder-gray-300 focus:ring-0 bg-transparent leading-relaxed"
                  style={{ minHeight: '400px' }}
                  disabled={loading}
                />
                
                {/* Content Stats */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                    <span>{readTime} min read</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Auto-saves every 30 seconds
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Tag className="inline w-4 h-4 mr-2" />
                  Tags <span className="text-gray-400 font-normal">(up to 5)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-emerald-600 hover:text-emerald-800 focus:outline-none"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 input-base"
                    maxLength={20}
                    disabled={loading || (formData.tags?.length || 0) >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || (formData.tags?.length || 0) >= 5}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tags help readers discover your story
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePage;
