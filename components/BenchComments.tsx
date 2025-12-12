'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, ChevronDown } from 'lucide-react';
import type { BenchComment } from '@/lib/types';

interface BenchCommentsProps {
  benchId: number;
}

export default function BenchComments({ benchId }: BenchCommentsProps) {
  const [comments, setComments] = useState<BenchComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [benchId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/benches/${benchId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !commentText.trim()) {
      alert('Please fill in both your name and comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/benches/${benchId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          comment: commentText,
        }),
      });

      if (response.ok) {
        setUserName('');
        setCommentText('');
        fetchComments();
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

 return (
    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={24} className="text-gray-700" />
          <h3 className="font-semibold text-gray-900 text-lg">
            Comments ({comments.length})
          </h3>
        </div>
        <ChevronDown 
          size={24} 
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible Content */}
      <div 
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-6 bg-white border-b border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Enter your name"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Your Comment
            </label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              placeholder="Share your thoughts about this bench..."
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>

      <div className="p-6 bg-white">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{comment.user_name}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
              </div>
            ))}
          </div>
)}
      </div>
      </div>
    </div>
  );
}