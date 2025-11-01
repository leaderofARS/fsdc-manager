import { createClient } from '@/utils/supabase/server';
import { users, type IUser } from '@/utils/users';
import { AccountDetails } from './AccountDetails';
import { Projects } from './Projects';
import { redirect } from 'next/navigation';
import { projects } from '@/utils/projects';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const userData = await users.getUser(user.id);
  if (!userData) redirect('/login');

  const userProjects = await projects.getUserProjects(user.id);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-8">
      {/* Sidebar */}
      <div className="w-full md:w-72 shrink-0">
        <AccountDetails initialData={userData} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Projects initialProjects={userProjects} />
      </div>
    </div>
  );
}