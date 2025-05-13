import { redirect } from 'next/navigation';

// Redirect root path to the dashboard
export default function Home() {
  redirect('/dashboard');
  return null; // Return null as redirect handles the navigation
}
