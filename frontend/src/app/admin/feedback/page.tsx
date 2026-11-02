'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Loader2, Filter } from 'lucide-react';

interface FeedbackItem {
  id: number;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
  conversation_id: number;
}

export default function AdminFeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(0);

  const fetchFeedback = useCallback(async () => {
    try {
      const data = await apiFetch('/admin/feedback?limit=100');
      setFeedback(data.feedback || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchFeedback();
    }
  }, [user, authLoading, router, fetchFeedback]);

  const filtered = ratingFilter > 0 ? feedback.filter(f => f.rating === ratingFilter) : feedback;

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '—';

  const positive = feedback.filter(f => f.rating >= 4).length;
  const negative = feedback.filter(f => f.rating <= 2).length;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );

  const ratingBg = (r: number) => {
    if (r >= 4) return 'border-l-green-400';
    if (r === 3) return 'border-l-yellow-400';
    return 'border-l-red-400';
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Citizen Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">Chatbot interaction ratings and comments</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{avgRating}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Rating</div>
            <div className="flex justify-center mt-1">
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${Number(avgRating) >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-gray-800">{feedback.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Reviews</div>
            <MessageSquare className="w-5 h-5 text-gray-300 mx-auto mt-1" />
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{positive}</div>
            <div className="text-sm text-gray-500 mt-1">Positive (4-5★)</div>
            <ThumbsUp className="w-5 h-5 text-green-300 mx-auto mt-1" />
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{negative}</div>
            <div className="text-sm text-gray-500 mt-1">Negative (1-2★)</div>
            <ThumbsDown className="w-5 h-5 text-red-300 mx-auto mt-1" />
          </div>
        </div>

        {/* Rating bar distribution */}
        {feedback.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Rating Distribution</h2>
            <div className="space-y-2">
              {[5,4,3,2,1].map(r => {
                const count = feedback.filter(f => f.rating === r).length;
                const pct = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-3 cursor-pointer" onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)}>
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-sm font-medium text-gray-700">{r}</span>
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all ${r >= 4 ? 'bg-green-400' : r === 3 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{width: `${pct}%`}} />
                    </div>
                    <span className={`text-xs w-10 text-right font-medium ${ratingFilter === r ? 'text-indigo-600' : 'text-gray-500'}`}>{count}</span>
                  </div>
                );
              })}
            </div>
            {ratingFilter > 0 && (
              <button onClick={() => setRatingFilter(0)} className="mt-3 text-xs text-indigo-600 hover:underline">Clear filter</button>
            )}
          </div>
        )}

        {/* Feedback list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{feedback.length === 0 ? 'No feedback received yet.' : 'No feedback with this rating.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(f => (
              <div key={f.id} className={`bg-white rounded-xl shadow-sm border-l-4 border border-gray-100 p-5 ${ratingBg(f.rating)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                        {f.user_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{f.user_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{f.user_email}</p>
                      </div>
                      {renderStars(f.rating)}
                    </div>
                    {f.comment && <p className="text-sm text-gray-600 leading-relaxed">{f.comment}</p>}
                    {!f.comment && <p className="text-sm text-gray-400 italic">No comment provided</p>}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0 text-right">
                    <p>{new Date(f.created_at).toLocaleDateString()}</p>
                    <p>{new Date(f.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
