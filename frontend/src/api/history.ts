import apiClient from './client';

export interface HistoryJob {
  title: string;
  company: string;
  location: string;
  score: number;
  matchReason: string;
  url: string;
}

export interface HistorySearch {
  jobSearchId: string;
  createdAt: string;
  targetRole: string;
  jobs: HistoryJob[];
}

export async function fetchJobHistory(): Promise<HistorySearch[]> {
  const response = await apiClient.get('/api/job-match/history');
  
  // Flat rows returned from backend (snake_case)
  const rows = response.data.data || [];
  return groupHistory(rows);
}

export function groupHistory(rows: any[]): HistorySearch[] {
  
  const map = new Map<string, HistorySearch>();
  
  rows.forEach((row: any) => {
    const searchId = row.job_search_id;
    if (!map.has(searchId)) {
      map.set(searchId, {
        jobSearchId: searchId,
        createdAt: row.created_at,
        targetRole: row.target_role || 'General Application',
        jobs: []
      });
    }
    
    map.get(searchId)!.jobs.push({
      title: row.title,
      company: row.company,
      location: row.location,
      score: Number(row.score),
      matchReason: row.match_reason,
      url: row.url
    });
  });
  
  // Maps iterate in insertion order. If backend ordered them correctly, 
  // we just array-ify. We'll explicitly sort them by createdAt DESC just in case.
  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Ensure jobs are sorted by score desc within each search
  result.forEach(search => {
    search.jobs.sort((a, b) => b.score - a.score);
  });
  
  return result;
}
