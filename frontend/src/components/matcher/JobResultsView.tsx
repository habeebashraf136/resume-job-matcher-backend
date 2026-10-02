import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobCard } from './JobCard';
import type { Job } from './JobCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, SlidersHorizontal, LayoutGrid, List, X, ExternalLink, Bookmark, BarChart2, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';

interface JobResultsViewProps {
  initialJobs: Job[];
}

type ViewMode = 'grid' | 'table' | 'scatter';
type SortMode = 'score' | 'semantic' | 'date' | 'company';

export function JobResultsView({ initialJobs }: JobResultsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('score');
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [hasSalary, setHasSalary] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const allJobTypes = useMemo(() => {
    const types = new Set<string>();
    initialJobs.forEach(job => {
      if (job.jobType) types.add(job.jobType);
    });
    return Array.from(types);
  }, [initialJobs]);

  const filteredJobs = useMemo(() => {
    let result = initialJobs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(job => 
        (job.title?.toLowerCase().includes(q)) ||
        (job.company?.toLowerCase().includes(q)) ||
        (job.description?.toLowerCase().includes(q))
      );
    }

    if (minScore > 0) {
      result = result.filter(job => job.score >= minScore);
    }

    if (selectedTypes.length > 0) {
      result = result.filter(job => job.jobType && selectedTypes.includes(job.jobType));
    }

    if (hasSalary) {
      result = result.filter(job => !!job.salary);
    }

    if (remoteOnly) {
      result = result.filter(job => job.location?.toLowerCase().includes('remote'));
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.score - a.score;
        case 'semantic': return (b.similarityScore || 0) - (a.similarityScore || 0);
        case 'date': 
          if (!a.postedAt) return 1;
          if (!b.postedAt) return -1;
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        case 'company': return (a.company || '').localeCompare(b.company || '');
        default: return 0;
      }
    });

    return result;
  }, [initialJobs, searchQuery, minScore, selectedTypes, hasSalary, remoteOnly, sortBy]);

  const toggleBookmark = (id: string) => {
    setBookmarkedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < 3) next.add(id);
      }
      return next;
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setMinScore(0);
    setSelectedTypes([]);
    setHasSalary(false);
    setRemoteOnly(false);
  };

  const totalJobs = initialJobs.length;
  const avgScore = initialJobs.length > 0 
    ? Math.round(initialJobs.reduce((acc, job) => acc + job.score, 0) / initialJobs.length) 
    : 0;
  const bestMatch = initialJobs.length > 0 
    ? initialJobs.reduce((best, job) => job.score > best.score ? job : best, initialJobs[0])
    : null;
  const above80 = initialJobs.filter(j => j.score >= 80).length;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-24">
      
      {/* SUMMARY STRIP */}
      <div className="flex flex-wrap items-center gap-4 bg-surface neo-border neo-shadow-sm rounded-neo p-4">
        <div className="flex-1 min-w-[120px]">
          <p className="text-xs text-ink uppercase tracking-wider font-bold mb-1">Total Found</p>
          <p className="text-2xl font-display font-bold text-ink">{totalJobs}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-xs text-ink uppercase tracking-wider font-bold mb-1">Avg Score</p>
          <p className="text-2xl font-display font-bold text-ink">{avgScore}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-xs text-ink uppercase tracking-wider font-bold mb-1">Great Matches</p>
          <p className="text-2xl font-display font-bold text-success">{above80}</p>
        </div>
        {bestMatch && (
          <div className="flex-[2] min-w-[200px] bg-yellow rounded-neo neo-border p-2 px-3">
            <p className="text-xs text-ink uppercase tracking-wider font-bold mb-1">Best Match ({bestMatch.score})</p>
            <p className="text-sm font-bold text-ink truncate" title={bestMatch.title}>{bestMatch.title}</p>
            <p className="text-xs font-medium text-ink truncate" title={bestMatch.company}>{bestMatch.company}</p>
          </div>
        )}
      </div>

      {/* POWER TOOLS BAR */}
      <Card interactive={false} className="p-4 flex flex-col gap-4 !rounded-neo">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink" size={18} strokeWidth={2.5} />
            <Input 
              placeholder="Search title, company, or keywords..." 
              className="pl-10 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <div className="flex items-center gap-1 mr-2 bg-surface p-1 rounded-neo neo-border">
              <button 
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 flex items-center justify-center rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-yellow text-ink border-2 border-ink' : 'text-ink hover:bg-yellow/50'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`w-9 h-9 flex items-center justify-center rounded-sm transition-colors ${viewMode === 'table' ? 'bg-yellow text-ink border-2 border-ink' : 'text-ink hover:bg-yellow/50'}`}
                title="Table View"
              >
                <List size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => setViewMode('scatter')}
                className={`w-9 h-9 flex items-center justify-center rounded-sm transition-colors ${viewMode === 'scatter' ? 'bg-yellow text-ink border-2 border-ink' : 'text-ink hover:bg-yellow/50'}`}
                title="Gravity Map"
              >
                <BarChart2 size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="relative">
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as SortMode)}
                className="appearance-none bg-yellow border-2 border-ink text-sm font-bold rounded-neo px-4 py-2 pr-8 text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 h-11 neo-shadow-sm cursor-pointer"
              >
                <option value="score">Sort by AI Score</option>
                <option value="semantic">Sort by Semantic Match</option>
                <option value="date">Sort by Date</option>
                <option value="company">Sort by Company</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1.5L6 6L10.5 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {compareIds.size > 0 && (
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => setShowCompareModal(true)}
                className="whitespace-nowrap ml-2"
              >
                Compare ({compareIds.size})
              </Button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t-2 border-ink text-sm font-bold text-ink">
          <div className="flex items-center gap-3 bg-pink px-3 py-1.5 rounded-pill neo-border">
            <span className="flex items-center gap-1"><SlidersHorizontal size={16} strokeWidth={2.5} /> Min Score: {minScore}</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={minScore} 
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-24 accent-ink"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input 
                type="checkbox" 
                checked={hasSalary} 
                onChange={e => setHasSalary(e.target.checked)}
                className="peer appearance-none w-5 h-5 neo-border rounded-sm bg-surface checked:bg-pink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink"
              />
              <Check size={14} strokeWidth={4} className="absolute text-ink pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            Has Salary
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input 
                type="checkbox" 
                checked={remoteOnly} 
                onChange={e => setRemoteOnly(e.target.checked)}
                className="peer appearance-none w-5 h-5 neo-border rounded-sm bg-surface checked:bg-pink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink"
              />
              <Check size={14} strokeWidth={4} className="absolute text-ink pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            Remote Only
          </label>
          
          <div className="h-5 w-0.5 bg-ink hidden md:block"></div>

          <div className="flex items-center gap-2 flex-wrap">
            {allJobTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-pill text-xs font-bold transition-all border-2 ${
                  selectedTypes.includes(type) 
                    ? 'bg-cyan border-ink text-ink neo-shadow-sm translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-surface border-ink text-ink hover:bg-yellow'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* RESULTS DISPLAY */}
      {filteredJobs.length === 0 ? (
        <Card interactive={false} className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-circle bg-yellow border-2 border-ink flex items-center justify-center text-ink mb-4 neo-shadow-sm">
            <Search size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-display font-bold text-ink mb-2">No jobs match your filters</h3>
          <p className="text-ink font-medium mb-6">Try adjusting your search criteria or resetting filters.</p>
          <Button variant="secondary" onClick={resetFilters}>Reset all filters</Button>
        </Card>
      ) : (
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 gap-6"
              >
                {filteredJobs.map((job, idx) => (
                  <JobCard 
                    key={job.jobId} 
                    job={job} 
                    index={idx} 
                    isBookmarked={bookmarkedJobIds.has(job.jobId)}
                    onToggleBookmark={toggleBookmark}
                    isCompareSelected={compareIds.has(job.jobId)}
                    onToggleCompare={toggleCompare}
                    compareDisabled={compareIds.size >= 3}
                  />
                ))}
              </motion.div>
            )}

            {/* TABLE VIEW */}
            {viewMode === 'table' && (
              <motion.div 
                key="table"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-x-auto rounded-neo neo-border bg-surface neo-shadow-sm"
              >
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-yellow text-ink border-b-2 border-ink">
                    <tr>
                      <th className="px-4 py-3 font-bold border-r-2 border-ink">Job Title</th>
                      <th className="px-4 py-3 font-bold border-r-2 border-ink">Company</th>
                      <th className="px-4 py-3 font-bold border-r-2 border-ink">AI Score</th>
                      <th className="px-4 py-3 font-bold border-r-2 border-ink">Location</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-ink">
                    {filteredJobs.map(job => (
                      <tr key={job.jobId} className="hover:bg-pink/20 transition-colors">
                        <td className="px-4 py-3 font-bold text-ink border-r-2 border-ink">
                          <a href={job.url} target="_blank" rel="noreferrer" className="hover:text-cyan transition-colors flex items-center gap-1 underline decoration-2 underline-offset-4">
                            {job.title} <ExternalLink size={14} strokeWidth={2.5} />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-ink font-medium border-r-2 border-ink">{job.company}</td>
                        <td className="px-4 py-3 border-r-2 border-ink">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-sm text-xs font-bold neo-border ${
                            job.score >= 80 ? 'bg-success text-ink' :
                            job.score >= 60 ? 'bg-yellow text-ink' : 'bg-danger text-ink'
                          }`}>
                            {job.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink font-medium border-r-2 border-ink">{job.location || 'N/A'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-ink hover:text-cyan">
                              <div className="relative flex items-center justify-center w-4 h-4">
                                <input 
                                  type="checkbox"
                                  checked={compareIds.has(job.jobId)}
                                  onChange={() => toggleCompare(job.jobId)}
                                  disabled={compareIds.size >= 3 && !compareIds.has(job.jobId)}
                                  className="peer appearance-none w-4 h-4 neo-border rounded-sm bg-surface checked:bg-pink transition-colors cursor-pointer"
                                />
                                <Check size={10} strokeWidth={4} className="absolute text-ink pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                              Cmp
                            </label>
                            <button 
                              onClick={() => toggleBookmark(job.jobId)}
                              className={`p-1.5 rounded-sm neo-border transition-all hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${bookmarkedJobIds.has(job.jobId) ? 'text-ink bg-pink' : 'text-ink bg-surface'}`}
                            >
                              <Bookmark size={14} className={bookmarkedJobIds.has(job.jobId) ? 'fill-ink' : ''} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* SCATTER VIEW (Gravity Map) */}
            {viewMode === 'scatter' && (
              <motion.div 
                key="scatter"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card interactive={false} className="p-8 h-[600px] flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-display font-bold text-ink">Gravity Map</h3>
                    <p className="text-sm font-medium text-ink">X: Semantic Similarity &nbsp;|&nbsp; Y: AI Fit Score. Jobs far off the diagonal show where the AI re-ranker disagreed with basic embeddings.</p>
                  </div>
                  
                  <div className="flex-1 relative bg-surface rounded-neo border-2 border-ink mt-4 overflow-hidden">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="border-t-2 border-l-2 border-ink"></div>
                      ))}
                    </div>
                    
                    {/* Axis Labels */}
                    <div className="absolute -bottom-6 w-full flex justify-between text-xs font-bold text-ink">
                      <span>0%</span><span>50%</span><span>100% (Semantic)</span>
                    </div>
                    <div className="absolute -left-8 h-full flex flex-col justify-between text-xs font-bold text-ink">
                      <span>100</span><span>50</span><span>0</span>
                    </div>

                    {/* Data Points */}
                    {filteredJobs.map(job => {
                      const x = job.similarityScore || Math.max(0, job.score - 20); 
                      const y = job.score;
                      
                      return (
                        <div 
                          key={job.jobId}
                          className="absolute w-4 h-4 -ml-2 -mb-2 rounded-circle cursor-pointer group z-10 hover:z-50 border-2 border-ink transition-transform hover:scale-150"
                          style={{
                            left: `${Math.max(2, Math.min(98, x))}%`,
                            bottom: `${Math.max(2, Math.min(98, y))}%`,
                            backgroundColor: y >= 80 ? 'var(--success)' : y >= 60 ? 'var(--yellow)' : 'var(--danger)',
                          }}
                          onClick={() => window.open(job.url, '_blank')}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface border-2 border-ink p-3 rounded-neo neo-shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-left">
                            <p className="text-sm font-bold text-ink truncate">{job.title}</p>
                            <p className="text-xs font-medium text-ink truncate mb-1">{job.company}</p>
                            <div className="flex justify-between text-xs font-mono font-bold">
                              <span className="text-ink bg-pink px-1 rounded-sm neo-border">AI: {y}</span>
                              <span className="text-ink bg-cyan px-1 rounded-sm neo-border">Sem: {Math.round(x)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

      {/* COMPARE MODAL */}
      <Modal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} title="Compare Jobs" className="max-w-6xl w-full">
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {Array.from(compareIds).map(id => {
              const job = initialJobs.find(j => j.jobId === id);
              if (!job) return null;
              return (
                <div key={job.jobId} className="flex flex-col gap-4 bg-surface rounded-neo p-5 border-2 border-ink relative group neo-shadow-sm">
                  <button 
                    onClick={() => toggleCompare(job.jobId)}
                    className="absolute top-4 right-4 p-1.5 text-ink bg-yellow neo-border hover:bg-danger rounded-circle opacity-0 group-hover:opacity-100 transition-all hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0_var(--ink)]"
                    title="Remove from compare"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                  
                  <div className="pr-8">
                    <h3 className="text-lg font-bold text-ink leading-tight mb-1">{job.title}</h3>
                    <p className="font-medium text-ink">{job.company}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-ink">
                    <div className="bg-surface neo-border rounded-neo p-3 text-center">
                      <p className="text-xs font-bold text-ink mb-1 uppercase">AI Score</p>
                      <p className={`text-2xl font-display font-bold px-2 py-1 rounded-sm border-2 border-ink ${
                        job.score >= 80 ? 'bg-success text-ink' : job.score >= 60 ? 'bg-yellow text-ink' : 'bg-danger text-ink'
                      }`}>{job.score}</p>
                    </div>
                    <div className="bg-surface neo-border rounded-neo p-3 text-center">
                      <p className="text-xs font-bold text-ink mb-1 uppercase">Semantic</p>
                      <p className="text-2xl font-display font-bold text-ink bg-cyan border-2 border-ink px-2 py-1 rounded-sm">{Math.round(job.similarityScore || 0)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm font-bold pt-3 border-t-2 border-ink flex-1">
                    <div className="flex justify-between items-center bg-surface neo-border p-2 rounded-sm">
                      <span className="text-ink">Location</span>
                      <span className="text-ink text-right max-w-[150px] truncate" title={job.location}>{job.location || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface neo-border p-2 rounded-sm">
                      <span className="text-ink">Type</span>
                      <span className="text-ink">{job.jobType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface neo-border p-2 rounded-sm">
                      <span className="text-ink">Salary</span>
                      <span className="text-ink">{job.salary || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-ink">
                    <p className="text-xs font-bold text-ink mb-2 uppercase tracking-wider bg-yellow inline-block px-2 py-1 border-2 border-ink rounded-sm">Match Reason</p>
                    <p className="text-sm text-ink font-medium leading-relaxed max-h-32 overflow-y-auto hide-scrollbar bg-surface neo-border p-3 rounded-sm">
                      {job.matchReason || 'No reasoning provided.'}
                    </p>
                  </div>
                  
                  <div className="pt-4 mt-auto">
                     <Button
                        variant="primary"
                        onClick={() => window.open(job.url, '_blank')}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        Apply <ExternalLink size={16} strokeWidth={2.5} />
                      </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
