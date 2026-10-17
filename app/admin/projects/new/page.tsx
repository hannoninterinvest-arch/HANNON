"use client";

import DashboardShell from "@/components/DashboardShell";
import ProjectForm from "@/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <DashboardShell title="New project">
      <ProjectForm />
    </DashboardShell>
  );
}
