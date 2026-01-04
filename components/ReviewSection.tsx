
import React, { useState } from 'react';
import { Review } from '../types';

const INITIAL_REVIEWS: Review[] = [
  {
    id: '1',
    donorName: 'Gates Foundation (Verified)',
    donorType: 'Foundation',
    rating: 5,
    comment: 'Exceptional transparency and measurable impact reporting. Highly recommended for long-term partnership.',
    date: '2 months ago',
    isVerified: true
  },
  {
    id: '2',
    donorName: 'Regional Arts Council',
    donorType: 'Government',
    rating: 4,
    comment: 'Great community engagement. Financial disclosures were prompt and accurate.',
    date: '5 months ago',
    isVerified: true
  }
];

export const ReviewSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showAdd, setShowAdd] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    const review: Review = {
      id: Date.now().toString(),
      donorName: 'Independent Donor',
      donorType: 'Individual',
      rating: newRating,
      comment: newComment,
      date: 'Just now',
      isVerified: false
    };
    setReviews([review, ...reviews]);
    setShowAdd(false);
    setNewComment('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Community Feedback</h3>
          <p className="text-slate-500">Verified donor experiences and organizational transparency scores.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm"
        >
          {showAdd ? 'Cancel' : 'Leave a Review'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl animate-fadeIn">
          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button 
                    key={num}
                    type="button"
                    onClick={() => setNewRating(num)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      newRating >= num ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-2">Your Experience</label>
              <textarea 
                className="w-full bg-white border border-indigo-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                placeholder="Share your experience working with this non-profit..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                  {review.donorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center">
                    {review.donorName}
                    {review.isVerified && (
                      <svg className="w-4 h-4 text-indigo-500 ml-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{review.donorType} • {review.date}</p>
                </div>
              </div>
              <div className="flex space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed italic">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};
