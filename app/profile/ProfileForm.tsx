'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Trash, Loader2, Upload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { users, type IUser } from '@/utils/users';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const supabase = createClient();

const profileFormSchema = z.object({
  name: z
    .string({ message: 'Name is required.' })
    .max(30, { message: 'Max 30 characters allowed.' }),
  email: z.string().email({ message: 'Invalid email.' }),
  description: z.string().max(160).optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(1, 'Platform name required'),
        url: z.string().url({ message: 'Enter a valid URL.' }),
      })
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: IUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user.avatar ||
      (user.provider !== 'email'
        ? user.user_metadata?.avatar_url
        : undefined)
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      description: user.description || '',
      links: user.links || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'links',
    control: form.control,
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'Something went wrong. Try again.',
        });
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (publicUrl) {
        setAvatarUrl(publicUrl);
        await users.updateProfile(user.id, { avatar: publicUrl });

        toast({
          title: 'Profile picture updated',
          description: 'Your profile picture has been uploaded successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'Could not retrieve public URL.',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Unexpected error occurred.',
      });
    } finally {
      setUploading(false);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSaving(true);

      await users.updateProfile(user.id, {
        name: data.name,
        description: data.description,
        links: data.links?.map((link) => ({
          ...link,
          id: crypto.randomUUID(),
        })),
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-[24rem] md:w-[36rem] mx-auto px-6 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center py-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Button variant="outline" asChild>
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Public Profile
          </Link>
        </Button>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={
              avatarUrl ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }
            draggable="false"
            alt="Avatar"
            className="h-24 w-24 rounded-full object-cover border"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="mt-3"
          disabled={uploading}
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="opacity-75" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a bit about yourself..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Links */}
          <div>
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`links.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-center">
                      <FormControl className="w-32">
                        <Input
                          placeholder="Platform"
                          value={field?.value?.label}
                          onChange={(e) =>
                            field.onChange({
                              ...field.value,
                              label: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          value={field?.value?.url}
                          onChange={(e) =>
                            field.onChange({
                              ...field.value,
                              url: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        className="p-2 text-red-500 hover:text-red-600"
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ label: '', url: '' })}
            >
              + Add Link
            </Button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSaving}
            className={cn(
              'w-full font-medium',
              'bg-primary text-black hover:bg-primary/90 dark:hover:bg-primary/80'
            )}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
