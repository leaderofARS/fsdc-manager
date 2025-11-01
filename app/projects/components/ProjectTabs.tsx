"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelsTopLeft, SquareKanban } from "lucide-react";
import SearchAndButton from "../Search";
import { ProjectList } from "../ProjectList";

interface ProjectTabsProps {
  activeProjects: IProject[];
  closedProjects: IProject[];
  allProjects: IProject[];
  searchTerm: string;
  setSearchTerm?: (term: string) => void;
  sortOrder: "newest" | "oldest";
  onSort?: (order: "newest" | "oldest") => void;
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProject) => void;
}

export const ProjectTabs = ({
  activeProjects,
  closedProjects,
  allProjects,
  searchTerm,
  setSearchTerm,
  sortOrder,
  onSort,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectTabsProps) => (
  <div className="w-full">
    <Tabs defaultValue="active-projects" className="w-full">
      <TabsList
        className="
    flex w-full flex-wrap justify-start gap-2
    bg-transparent p-0 border-b border-slate-200 dark:border-slate-700
  "
      >
        <TabsTrigger
          value="active-projects"
          className="
      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
      text-slate-600 dark:text-slate-300
      data-[state=active]:bg-transparent
      data-[state=active]:text-slate-900 dark:data-[state=active]:text-white
      data-[state=active]:border-b-2 data-[state=active]:border-green-500
      transition-colors duration-200
    "
        >
          <PanelsTopLeft className="w-4 h-4" />
          Active
        </TabsTrigger>

        <TabsTrigger
          value="closed-projects"
          className="
      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
      text-slate-600 dark:text-slate-300
      data-[state=active]:bg-transparent
      data-[state=active]:text-slate-900 dark:data-[state=active]:text-white
      data-[state=active]:border-b-2 data-[state=active]:border-green-500
      transition-colors duration-200
    "
        >
          <SquareKanban className="w-4 h-4" />
          Closed
        </TabsTrigger>

        <TabsTrigger
          value="all-projects"
          className="
      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
      text-slate-600 dark:text-slate-300
      data-[state=active]:bg-transparent
      data-[state=active]:text-slate-900 dark:data-[state=active]:text-white
      data-[state=active]:border-b-2 data-[state=active]:border-green-500
      transition-colors duration-200
    "
        >
          <SquareKanban className="w-4 h-4" />
          All
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active-projects" className="mt-5 space-y-3">
        <SearchAndButton
          placeholderText="Search active projects"
          onSearch={setSearchTerm}
        />
        <ProjectList
          tab="active"
          projects={activeProjects}
          sortOrder={sortOrder}
          onSort={onSort}
          setProjectToClose={setProjectToClose}
          setProjectToReopen={setProjectToReopen}
          setProjectToDelete={setProjectToDelete}
        />
      </TabsContent>

      <TabsContent value="closed-projects" className="mt-5 space-y-3">
        <SearchAndButton
          placeholderText="Search closed projects"
          onSearch={setSearchTerm}
        />
        <ProjectList
          tab="closed"
          projects={closedProjects}
          sortOrder={sortOrder}
          onSort={onSort}
          setProjectToClose={setProjectToClose}
          setProjectToReopen={setProjectToReopen}
          setProjectToDelete={setProjectToDelete}
        />
      </TabsContent>

      <TabsContent value="all-projects" className="mt-5 space-y-3">
        <SearchAndButton
          placeholderText="Search all projects"
          onSearch={setSearchTerm}
        />
        <ProjectList
          tab="all"
          projects={allProjects}
          sortOrder={sortOrder}
          onSort={onSort}
          setProjectToClose={setProjectToClose}
          setProjectToReopen={setProjectToReopen}
          setProjectToDelete={setProjectToDelete}
        />
      </TabsContent>
    </Tabs>
  </div>
);
