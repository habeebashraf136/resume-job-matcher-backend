import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJobHistory } from '../api/history';
import type { HistorySearch, HistoryJob } from '../api/history';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ChevronDown, ChevronUp, AlertCircle, RefreshCw, ExternalLink, Calendar, Target, Briefcase } from 'lucide-react';

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffInDays = Math.floor((Date.now() - date.getTime()) / (1000 * 3600 * 24));
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function formatDateAbsolute(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

function ProgressChart({ searches }: { searches: HistorySearch[] }) {
  if (searches.length < 2) return null;

  const chronological = [...searches].reverse();
  
  const data = chronological.map(s => {
    const avg = s.jobs.reduce((acc, j) => acc + j.score, 0) / (s.jobs.length || 1);
    return { date: s.createdAt, avgScore: avg };
  });

  const minScore = 0;
  const maxScore = 100;
  const height = 140;
  const width = 600; 
  
  const getCoordinatesForIndex = (index: number, score: number) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((score - minScore) / (maxScore - minScore)) * height;
    return `${x},${y}`;
  };

  const polylinePoints = data.map((d, i) => getCoordinatesForIndex(i, d.avgScore)).join(' ');

  return (
    <Card interactive={false} className="p-6 mb-8 overflow-hidden bg-surface">
      <h3 className="text-xl font-display font-bold text-ink mb-6">Progress Over Time</h3>
      <div className="w-full overflow-x-auto hide-scrollbar pb-6 pt-4">
        <svg 
          viewBox={`-20 -20 ${width + 40} ${height + 40}`} 
          className="w-full min-w-[500px] h-48 overflow-visible"
          role="img"
          aria-label="Line chart showing average match score over time"
        >
          {/* Grid lines */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="var(--ink)" strokeWidth="2" />
          
          {/* Line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* Points & Labels */}
          {data.map((d, i) => {
            const [cx, cy] = getCoordinatesForIndex(i, d.avgScore).split(',');
            return (
              <g key={i}>
                <rect 
                  x={Number(cx) - 5} 
                  y={Number(cy) - 5} 
                  width="10" 
                  height="10" 
                  fill="var(--cyan)" 
                  stroke="var(--ink)" 
                  strokeWidth="2" 
                />
                <text 
                  x={cx} 
                  y={Number(cy) - 15} 
                  fill="var(--ink)" 
                  fontSize="12" 
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {Math.round(d.avgScore)}
                </text>
                <text 
                  x={cx} 
                  y={height + 20} 
                  fill="var(--ink)" 
                  fontSize="12" 
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {formatDateAbsolute(d.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="sr-only">
        Your average score progression over your last {data.length} searches ranges from {Math.round(Math.min(...data.map(d => d.avgScore)))} to {Math.round(Math.max(...data.map(d => d.avgScore)))}.
      </p>
    </Card>
  );
}

function MiniSparkline({ jobs }: { jobs: HistoryJob[] }) {
  if (!jobs.length) return null;
  const scores = jobs.map(j => j.score);
  const width = 100;
  const height = 40;
  
  const polylinePoints = scores.map((s, i) => {
    const x = (i / Math.max(1, scores.length - 1)) * width;
    const y = height - (s / 100) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="overflow-visible group relative">
        <polyline points={polylinePoints} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
        {scores.map((s, i) => {
          const x = (i / Math.max(1, scores.length - 1)) * width;
          const y = height - (s / 100) * height;
          return (
            <g key={i} className="group/point">
              <rect 
                x={x - 3} 
                y={y - 3} 
                width="6" 
                height="6" 
                fill={s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--yellow)' : 'var(--danger)'} 
                stroke="var(--ink)" 
                strokeWidth="1.5"
                className="hover:scale-150 transition-transform cursor-pointer"
              />
              <text 
                x={x} 
                y={y - 8} 
                fill="var(--ink)" 
                fontSize="10" 
                fontWeight="bold" 
                textAnchor="middle" 
                className="opacity-0 group-hover/point:opacity-100"
              >
                {s}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HistoryMissionCard({ search }: { search: HistorySearch }) {
  const [expanded, setExpanded] = useState(false);
  
  const topScore = search.jobs.length > 0 ? search.jobs[0].score : 0;
  
  return (
    <Card interactive={false} className="overflow-hidden bg-surface p-0">
      <div 
        className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-surface/90 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-display font-bold text-ink flex items-center gap-2">
              <Target size={20} strokeWidth={2.5} />
              {search.targetRole}
            </h3>
            <span className="px-3 py-0.5 rounded-pill bg-purple neo-border text-xs font-bold text-ink neo-shadow-sm">
              {search.jobs.length} jobs
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-ink">
            <div className="flex items-center gap-1 bg-yellow px-2 py-0.5 rounded-sm neo-border" title={formatDateAbsolute(search.createdAt)}>
              <Calendar size={14} strokeWidth={2.5} />
              {formatRelativeTime(search.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 self-end md:self-center">
          <div className="hidden md:block">
            <MiniSparkline jobs={search.jobs} />
          </div>
          <div className="text-center w-16 bg-surface neo-border p-2 rounded-sm neo-shadow-sm">
            <span className="block text-2xl font-mono font-bold text-ink">{topScore}</span>
          </div>
          <div className="text-ink w-8 h-8 rounded-sm neo-border bg-yellow flex items-center justify-center neo-shadow-sm transition-transform active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
            {expanded ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={3} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-ink bg-bg p-6"
          >
            <div className="space-y-4">
              {search.jobs.map((job, idx) => (
                <div key={idx} className="flex flex-col lg:flex-row gap-4 p-5 rounded-neo border-2 border-ink bg-surface neo-shadow-sm">
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-ink">{job.title}</h4>
                        <p className="font-medium text-ink flex items-center gap-2 mt-1">
                          <Briefcase size={16} strokeWidth={2.5} /> {job.company}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-sm border-2 border-ink text-sm font-bold flex flex-col items-center justify-center min-w-[48px] ${
                          job.score >= 80 ? 'bg-success text-ink' :
                          job.score >= 60 ? 'bg-yellow text-ink' : 'bg-danger text-ink'
                        }`}>
                          <span className="text-xl font-mono">{job.score}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow neo-border p-3 rounded-sm">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[#111111]">Match Reason</p>
                      <p className="text-sm text-[#111111] font-medium leading-relaxed line-clamp-2">{job.matchReason}</p>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4 lg:min-w-[140px] lg:border-l-2 lg:border-ink lg:pl-6">
                    <span className="text-sm font-bold text-ink bg-purple px-2 py-1 rounded-sm neo-border">{job.location || 'Remote'}</span>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(job.url, '_blank');
                      }}
                    >
                      Apply <ExternalLink size={14} strokeWidth={2.5} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'score'>('newest');

  const { data: history = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['jobHistory'],
    queryFn: fetchJobHistory,
    refetchOnWindowFocus: false
  });

  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(search => {
        if (search.targetRole.toLowerCase().includes(q)) return true;
        return search.jobs.some(j => 
          j.title.toLowerCase().includes(q) || 
          j.company.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === 'score') {
      result.sort((a, b) => {
        const scoreA = a.jobs.length > 0 ? a.jobs[0].score : 0;
        const scoreB = b.jobs.length > 0 ? b.jobs[0].score : 0;
        return scoreB - scoreA;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [history, searchQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 min-h-[calc(100vh-64px)] flex flex-col relative bg-bg">
      <div className="mb-10 relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink uppercase mb-4">
            Mission History
          </h1>
          <p className="text-ink font-medium text-lg">
            Review past job matching pipelines and track your score progression over time.
          </p>
        </div>
        
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64 flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111] z-10" size={18} strokeWidth={2.5} />
              <input 
                type="text"
                placeholder="Search role or company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-11 w-full rounded-pill bg-white text-[#111111] caret-[#111111] font-bold border-2 border-ink focus:outline-none focus:ring-3 focus:ring-yellow placeholder:text-[#666666] neo-shadow-sm transition-all"
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'score')}
                className="appearance-none bg-yellow border-2 border-ink text-sm font-bold rounded-neo pl-4 pr-10 py-2 text-[#111111] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 h-11 w-full neo-shadow-sm cursor-pointer"
              >
                <option value="newest" className="bg-surface text-ink font-bold">Newest First</option>
                <option value="score" className="bg-surface text-ink font-bold">Best Top-Score</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111111]">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1.5L6 6L10.5 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative z-10 w-full max-w-5xl mx-auto">
        {isLoading && (
          <div className="space-y-6">
            <div className="h-48 bg-[#E5E5E5] animate-stripe rounded-neo neo-border" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)', backgroundSize: '28px 28px' }} />
            <div className="h-32 bg-[#E5E5E5] animate-stripe rounded-neo neo-border" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)', backgroundSize: '28px 28px' }} />
            <div className="h-32 bg-[#E5E5E5] animate-stripe rounded-neo neo-border" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)', backgroundSize: '28px 28px' }} />
          </div>
        )}

        {isError && (
          <Card interactive={false} className="p-12 text-center bg-danger">
            <AlertCircle className="mx-auto mb-4 text-ink" size={48} strokeWidth={2.5} />
            <h3 className="text-2xl font-bold text-ink mb-2">Failed to load history</h3>
            <p className="text-ink font-medium mb-6">There was a problem retrieving your past searches.</p>
            <Button onClick={() => refetch()} variant="secondary" className="mx-auto flex items-center">
              <RefreshCw size={16} className="mr-2 text-ink" strokeWidth={2.5} /> Try Again
            </Button>
          </Card>
        )}

        {!isLoading && !isError && history.length === 0 && (
          <Card interactive={false} className="p-12 text-center max-w-xl mx-auto">
            <div className="w-20 h-20 bg-yellow rounded-neo border-2 border-ink mx-auto flex items-center justify-center mb-6 neo-shadow-sm">
              <span className="text-4xl">🚀</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-ink mb-3">No Missions Yet</h3>
            <p className="text-ink font-medium mb-8">
              You haven't run any AI job matching pipelines yet. Upload your resume to start finding your perfect job.
            </p>
            <Link to="/app">
              <Button variant="primary">Start First Mission</Button>
            </Link>
          </Card>
        )}

        {!isLoading && !isError && history.length > 0 && (
          <>
            <ProgressChart searches={history} />
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-bold text-ink mb-2 px-6 uppercase tracking-wider">
                <div className="flex-1">Timeline</div>
                <div className="w-[100px] text-center hidden md:block">Score trend</div>
                <div className="w-[64px] text-center">Top score</div>
                <div className="w-8"></div>
              </div>
              
              <AnimatePresence>
                {filteredHistory.map((search, i) => (
                  <motion.div
                    key={search.jobSearchId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <HistoryMissionCard search={search} />
                  </motion.div>
                ))}
                
                {filteredHistory.length === 0 && (
                  <div className="py-12 text-center font-bold text-ink">
                    No history found matching your filters.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
