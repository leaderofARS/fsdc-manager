'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { projects } from '@/utils/projects';
import { secondaryBtnStyles } from '@/app/commonStyles';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloseProjectDialog } from '../../components/CloseProjectDialog';
import { DeleteProjectDialog } from '../../components/DeleteProjectDialog';
import TextEditor from '@/components/TextEditor';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { useAccessStore } from '@/stores/useAccessStore';
import { ProjectAction } from '@/consts';

interface ProjectSettingsFormProps {
  project: IProject;
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    readme: project.readme,
  });

  const { toast } = useToast();
  const router = useRouter();
  const { can, isLoading } = useProjectAccess({ projectId: project.id });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Loading...
      </div>
    );

  if (!can(ProjectAction.VIEW_SETTINGS)) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400">
        You don&apos;t have permission to manage project settings.
      </div>
    );
  }

  const handleUpdateProject = async () => {
    try {
      setIsSaving(true);
      await projects.management.update(project.id, formData);
      toast({
        title: 'Success',
        description: 'Project settings updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update project settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseProject = async () => {
    try {
      await projects.management.close(project.id);
      toast({
        title: 'Success',
        description: 'Project closed successfully',
      });
      router.push('/projects');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to close project',
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projects.management.delete(project.id);
      useAccessStore.getState().reset();
      router.push('/projects');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project',
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-8">
      {/* ---- PROJECT SETTINGS ---- */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold">Project Settings</h2>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter project name"
            className="w-full"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Short project description"
            className="w-full min-h-[90px]"
          />
        </div>

        {/* README */}
        <div className="space-y-2">
          <Label>README</Label>
          <div className="border rounded-md p-2 sm:p-3">
            <TextEditor
              content={formData.readme}
              onChange={(text) =>
                setFormData((prev) => ({ ...prev, readme: text }))
              }
              isEditable
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            onClick={handleUpdateProject}
            disabled={isSaving}
            className={cn(secondaryBtnStyles, 'w-full sm:w-auto')}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* ---- DANGER ZONE ---- */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>

        <div className="border border-red-500 rounded-md divide-y divide-red-500/50 overflow-hidden">
          {can(ProjectAction.CLOSE_PROJECT) && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Close Project</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Closing will disable workflows and remove it from open
                  projects.
                </p>
              </div>
              <Button
                onClick={() => setShowCloseDialog(true)}
                className={cn(
                  secondaryBtnStyles,
                  'text-red-500 dark:text-red-400 w-full sm:w-auto'
                )}
              >
                Close Project
              </Button>
            </div>
          )}

          {can(ProjectAction.DELETE_PROJECT) && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Delete Project</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Once deleted, this action cannot be undone.
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className={cn(
                  secondaryBtnStyles,
                  'text-red-500 dark:text-red-400 w-full sm:w-auto'
                )}
              >
                Delete Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CloseProjectDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        onConfirm={handleCloseProject}
      />
      <DeleteProjectDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteProject}
        projectName={project.name}
      />
    </div>
  );
}
