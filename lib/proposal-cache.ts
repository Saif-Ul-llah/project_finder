// Persistent (localStorage, not sessionStorage) cache for generated
// proposals, keyed by job id. Generating a proposal costs LLM tokens, so
// once a job has one, re-opening it should read from here instead of
// calling the backend again.

import { GeneratedProposal } from './types';

const PREFIX = 'proposal:';

export function readProposal(jobId: number): GeneratedProposal | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${jobId}`);
    return raw ? (JSON.parse(raw) as GeneratedProposal) : null;
  } catch {
    return null;
  }
}

export function writeProposal(proposal: GeneratedProposal): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PREFIX}${proposal.job_id}`, JSON.stringify(proposal));
  } catch {
    /* quota / serialization issues are non-fatal */
  }
}

export function clearProposal(jobId: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${PREFIX}${jobId}`);
  } catch {
    /* non-fatal */
  }
}
