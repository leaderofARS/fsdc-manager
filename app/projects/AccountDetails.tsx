'use client';

import { ProfilePhotoUploader } from '@/components/ProfilePhotoUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { users, type IUser } from '@/utils/users';
import { ExternalLink, Link as LinkIcon, Loader2, X, Plus, Pencil } from 'lucide-react';
import { useState } from 'react';

interface AccountDetailsProps {
  initialData: IUser;
}

export const AccountDetails = ({ initialData }: AccountDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<IUser>(initialData);
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    links: initialData.links?.length ? initialData.links : [{ id: '', label: '', url: '' }],
  });
  const { toast } = useToast();

  const safeLinks = (links: any) => Array.isArray(links) ? links : [];

  const handleSave = async () => {
    if (!userData) return;
    try {
      setIsSaving(true);
      const cleanedLinks = (formData.links || []).filter((l) => (l?.label || '').trim() && (l?.url || '').trim());
      await users.updateProfile(userData.id, {
        name: formData.name,
        description: formData.description,
        links: cleanedLinks.map((l: any) => ({ ...l, id: l.id || crypto.randomUUID() })),
      });

      setUserData({ ...userData, name: formData.name, description: formData.description, links: cleanedLinks });
      setIsEditing(false);
      toast({ title: 'Profile updated', description: 'Your profile has been successfully updated.' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile. Try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => setFormData(prev => ({ ...prev, links: [...(prev.links || []), { id: '', label: '', url: '' }] }));
  const removeLink = (index: number) => setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((l, i) => i === index ? { ...l, [field]: value } : l)
    }));
  };

  return (
    <aside className="w-full md:w-72">
      <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <ProfilePhotoUploader
            currentPhotoUrl={userData.avatar}
            userProvider={userData.provider}
            onPhotoUploaded={async (url) => {
              if (!userData) return;
              await users.updateProfile(userData.id, { avatar: url ?? undefined });
              setUserData(prev => ({ ...prev, avatar: url ?? undefined }));
            }}
          />

          <div className="mt-3 text-center">
            <div className="flex items-center gap-2 justify-center">
              <h3 className="text-lg font-semibold">{userData.name || 'Unnamed'}</h3>
              <button
                aria-label="Edit profile"
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Pencil className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{userData.email}</p>
          </div>

          {!isEditing && (
            <>
              {userData.description && <p className="mt-3 text-sm text-center text-slate-600 dark:text-slate-400">{userData.description}</p>}

              <div className="w-full mt-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Links</h4>
                <div className="space-y-2">
                  {safeLinks(userData.links).length === 0 && (
                    <p className="text-xs text-muted-foreground">No links added yet.</p>
                  )}
                  {safeLinks(userData.links).map((link) => (
                    <a
                      key={link.id || link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{link.label}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>

              <Button onClick={() => setIsEditing(true)} className="mt-5 w-full">Edit profile</Button>
            </>
          )}

          {isEditing && (
            <form className="w-full mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Name</label>
                <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Bio</label>
                <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="h-20" />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Links</label>
                <div className="space-y-2 mt-2">
                  {formData.links.map((ln, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input placeholder="Platform" value={ln.label} onChange={(e) => updateLink(idx, 'label', e.target.value)} className="w-28" />
                      <Input placeholder="https://example.com" value={ln.url} onChange={(e) => updateLink(idx, 'url', e.target.value)} />
                      <button type="button" onClick={() => removeLink(idx)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addLink} className="mt-2 w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add link
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
};
