import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to login page if not authenticated, or dashboard if authenticated
  // For now, redirect to login
  redirect('/admin/login');
}

