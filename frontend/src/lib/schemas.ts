import { z } from 'zod'

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional(),
})

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
})

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  updated: z.string().optional(),
})

export const ActivitySchema = z.object({
  id: z.union([z.string(), z.number()]),
  time: z.string(),
  text: z.string(),
})

export const SystemStatusSchema = z.object({
  cpu: z.string().optional(),
  cpu_percent: z.number().optional(),
  ram: z.string().optional(),
  ram_percent: z.number().optional(),
  gpu: z.string().optional(),
  gpu_percent: z.number().optional(),
  disk: z.string().optional(),
  disk_percent: z.number().optional(),
})

export const ModelsArraySchema = z.array(ModelSchema)
export const AgentsArraySchema = z.array(AgentSchema)
export const ProjectsArraySchema = z.array(ProjectSchema)
export const ActivityArraySchema = z.array(ActivitySchema)

export type Model = z.infer<typeof ModelSchema>
export type Agent = z.infer<typeof AgentSchema>
export type Project = z.infer<typeof ProjectSchema>
export type ActivityItem = z.infer<typeof ActivitySchema>
export type SystemStatus = z.infer<typeof SystemStatusSchema>
