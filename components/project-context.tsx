"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Project = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  progress: number
  status: "active" | "draft" | "completed" | "archived"
}

type ProjectContextType = {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  allProjects: Project[]
  addProject: (project: Project) => void
  isValidProjectId: (id: string | undefined) => boolean
  archiveProject: (projectId: string) => void
  duplicateProject: (projectId: string) => void
  getArchivedProjects: () => Project[]
  deleteProject: (projectId: string) => void
}

// Initial projects array with one completed project and one blank project
const initialProjects: Project[] = [
  {
    id: "enterprise-satisfaction",
    name: "Enterprise Customer Satisfaction",
    description:
      "Comprehensive survey of our enterprise customers to understand satisfaction levels and identify improvement areas",
    createdAt: "2023-10-15T09:00:00Z",
    updatedAt: "2023-11-20T14:30:00Z",
    progress: 100,
    status: "completed",
  },
  {
    id: "new-product-feedback",
    name: "New Product Feedback",
    description: "Gather initial feedback on our upcoming product release",
    createdAt: "2023-11-25T10:00:00Z",
    updatedAt: "2023-11-25T10:00:00Z",
    progress: 0,
    status: "draft",
  },
]

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Set current project based on URL if needed
    const path = window.location.pathname
    const projectIdMatch = path.match(/\/projects\/([^\/]+)/)
    if (projectIdMatch) {
      const projectId = projectIdMatch[1]
      const project = allProjects.find(p => p.id === projectId)
      if (project) {
        setCurrentProject(project)
      }
    }
    setIsInitialized(true)
  }, [])

  // Function to add a new project
  const addProject = (project: Project) => {
    setAllProjects((prev) => [...prev, project])
  }

  // Function to archive a project
  const archiveProject = (projectId: string) => {
    setAllProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, status: "archived" } : project
      )
    )
  }

  // Function to duplicate a project
  const duplicateProject = (projectId: string) => {
    const projectToDuplicate = allProjects.find((p) => p.id === projectId)
    if (projectToDuplicate) {
      const newProject: Project = {
        ...projectToDuplicate,
        id: `${projectToDuplicate.id}-copy-${Date.now()}`,
        name: `${projectToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
        progress: 0,
      }
      addProject(newProject)
    }
  }

  // Function to get archived projects
  const getArchivedProjects = () => {
    return allProjects.filter((project) => project.status === "archived")
  }

  // Function to delete a project
  const deleteProject = (projectId: string) => {
    setAllProjects((prev) => prev.filter((project) => project.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
    }
  }

  // Function to check if a project ID is valid
  const isValidProjectId = (id: string | undefined): boolean => {
    if (!id || id === "undefined") return false
    return allProjects.some((project) => project.id === id)
  }

  if (!isInitialized) {
    return null // or a loading state
  }

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        allProjects,
        addProject,
        isValidProjectId,
        archiveProject,
        duplicateProject,
        getArchivedProjects,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
