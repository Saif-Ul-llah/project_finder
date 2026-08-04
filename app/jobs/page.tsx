import { redirect } from 'next/navigation';

// The unified opportunities feed lives at /projects (Upwork + Freelancer).
// This route is kept for backward compatibility and redirects there.
export default function JobsPage() {
  redirect('/projects');
}
