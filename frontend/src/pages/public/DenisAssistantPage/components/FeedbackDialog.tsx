// DenisAssistantPage/components/FeedbackDialog.tsx
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comments: string) => void;
  onSkip: () => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white shadow-2xl overflow-hidden flex flex-col p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold dark:text-white light:text-slate-800 font-display">
            How was your experience?
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg dark:hover:bg-zinc-800 light:hover:bg-slate-100 dark:text-zinc-400 light:text-zinc-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => {
            const active = hoverRating ? star <= hoverRating : star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 cursor-pointer transition-transform duration-100 hover:scale-110"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    active 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-zinc-600 dark:text-zinc-700 light:text-slate-350'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Comments Textarea */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="feedback-comments" className="text-[10px] font-semibold dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider">
            Add your comments (optional)
          </label>
          <textarea
            id="feedback-comments"
            rows={3}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Tell us what you liked or how we can improve..."
            className="w-full px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-800/60 light:bg-slate-50 dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet resize-none placeholder:dark:text-zinc-600 placeholder:light:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onSkip}
            className="text-xs font-semibold dark:text-zinc-500 light:text-slate-400 hover:text-accent-violet transition-colors cursor-pointer"
          >
            Skip
          </button>
          
          <button
            onClick={() => {
              onSubmit(rating, comments);
              onClose();
            }}
            disabled={rating === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
