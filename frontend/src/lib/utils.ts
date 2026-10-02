import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (err: any): string => {
  if (typeof err === 'string') return err;
  if (err?.response?.data) {
    const data = err.response.data;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e: any) => e.msg || 'Validation error').join(', ');
    }
    if (data.message) {
      return data.message;
    }
  }
  if (err?.message) {
    return err.message;
  }
  return "An unknown error occurred";
};

export const getScoreBand = (score: number) => {
  if (score >= 80) return { label: 'Excellent', color: '#22c55e', textClass: 'text-green-500', bgClass: 'bg-green-500/20' };
  if (score >= 60) return { label: 'Good', color: '#f59e0b', textClass: 'text-amber-500', bgClass: 'bg-amber-500/20' };
  return { label: 'Fair', color: '#ef4444', textClass: 'text-red-500', bgClass: 'bg-red-500/20' };
};
