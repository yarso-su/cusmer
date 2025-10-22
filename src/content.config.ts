import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const legalDocuments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    version: z.string(),
    publishedAt: z.date()
  })
})

export const collections = { legalDocuments }
