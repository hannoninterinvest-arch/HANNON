"use client";
import { useParams } from "next/navigation";
import ProjectEditor from "@/components/ProjectEditor";
export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  return <ProjectEditor key={id} id={id} />;
}
