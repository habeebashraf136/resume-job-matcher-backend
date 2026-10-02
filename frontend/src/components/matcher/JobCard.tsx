import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface Job {
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  jobType: string;
  salary?: string;
  postedAt?: string;
  similarityScore: number;
  score: number;
  matchReason: string;
}

interface JobCardProps {
  job: Job;
  index: number;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  isCompareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  compareDisabled?: boolean;
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}

function ScoreBadge({ score, label, isSimilarity = false }: { score: number, label: string, isSimilarity?: boolean }) {
  let colorClass = 'bg-danger'; 
  let textLabel = 'Weak';
  if (score >= 80) {
    colorClass = 'bg-success'; 
    textLabel = 'Strong';
  } else if (score >= 60) {
    colorClass = 'bg-yellow'; 
    textLabel = 'Good';
  }

  if (isSimilarity) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ink">{label}</span>
        <div className="flex items-center justify-center rounded-pill neo-border bg-pink px-2 py-0.5 text-xs font-mono font-bold text-ink">
          {score}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex items-center justify-center w-12 h-12 rounded-neo neo-border neo-shadow-sm ${colorClass}`}>
        <span className="font-bold font-mono text-xl text-ink">{score}</span>
      </div>
      <div className="text-center flex flex-col items-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink">{label}</p>
        <p className="text-xs font-bold text-ink">{textLabel}</p>
      </div>
    </div>
  );
}

export function JobCard({ 
  job, 
  index, 
  isBookmarked, 
  onToggleBookmark,
  isCompareSelected,
  onToggleCompare,
  compareDisabled 
}: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const relativeTime = formatRelativeTime(job.postedAt);
  const canApply = job.url && job.url.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.05, 0.5), ease: "easeOut" }}
    >
      <Card className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-bold font-display text-ink mb-1">{job.title}</h3>
                <p className="text-ink font-medium text-lg">{job.company}</p>
              </div>
              
              {onToggleBookmark && (
                <button 
                  onClick={() => onToggleBookmark(job.jobId)}
                  className={`w-10 h-10 rounded-circle flex items-center justify-center neo-border transition-all duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink ${isBookmarked ? 'bg-pink neo-shadow-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none text-ink' : 'bg-surface hover:bg-yellow text-ink hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'}`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Job'}
                >
                  {isBookmarked ? <BookmarkCheck size={20} strokeWidth={2.5} /> : <Bookmark size={20} />}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm font-bold text-ink">
              <div className="flex items-center gap-1.5 bg-surface px-3 py-1 rounded-pill neo-border">
                <MapPin size={14} />
                {job.location}
              </div>
              <div className="flex items-center gap-1.5 bg-surface px-3 py-1 rounded-pill neo-border">
                <Briefcase size={14} />
                <span className="capitalize">{job.jobType}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-1.5 bg-surface px-3 py-1 rounded-pill neo-border">
                  <DollarSign size={14} />
                  {job.salary}
                </div>
              )}
              {relativeTime && (
                <div className="flex items-center gap-1.5 bg-surface px-3 py-1 rounded-pill neo-border">
                  <Calendar size={14} />
                  {relativeTime}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 self-center md:self-start bg-surface p-4 rounded-neo neo-border neo-shadow-sm">
            <ScoreBadge score={Math.round(job.score)} label="AI Fit" />
            <div className="w-0.5 h-12 bg-ink" />
            <ScoreBadge score={Math.round(job.similarityScore)} label="Semantic" isSimilarity={true} />
          </div>
        </div>

        <div className="space-y-4 border-t-2 border-ink pt-5">
          <div>
            <div className="bg-yellow neo-border rounded-neo p-4 neo-shadow-sm">
              <h4 className="text-sm font-bold text-ink mb-2 uppercase tracking-wider">Why this matches</h4>
              <p className="text-sm text-ink leading-relaxed font-medium">
                {job.matchReason}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink mb-2 uppercase tracking-wider">Description</h4>
            <div className={`text-sm text-ink leading-relaxed whitespace-pre-wrap font-medium ${!expanded ? 'line-clamp-4' : ''}`}>
              {job.description}
            </div>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-ink hover:text-cyan font-bold text-sm mt-2 focus:outline-none underline decoration-2 underline-offset-4 transition-colors"
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-ink flex justify-between items-center">
          {onToggleCompare ? (
            <label className={`flex items-center gap-3 cursor-pointer text-sm font-bold transition-colors ${compareDisabled && !isCompareSelected ? 'opacity-50 cursor-not-allowed text-ink' : 'text-ink hover:text-cyan group'}`}>
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="checkbox"
                  checked={!!isCompareSelected}
                  onChange={() => onToggleCompare(job.jobId)}
                  disabled={compareDisabled && !isCompareSelected}
                  className="peer appearance-none w-5 h-5 neo-border rounded-sm bg-surface checked:bg-pink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink"
                />
                <Bookmark size={14} strokeWidth={4} className="absolute text-ink pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              Compare
            </label>
          ) : <div />}

          <Button
            variant="primary"
            disabled={!canApply}
            onClick={() => {
              if (canApply) window.open(job.url, '_blank', 'noopener,noreferrer');
            }}
            className="flex items-center gap-2"
          >
            Apply Now
            <ExternalLink size={16} strokeWidth={2.5} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
