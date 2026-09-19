import { createCollection, localStorageCollectionOptions } from '@tanstack/react-db'
import { z } from 'zod'

import { makeId, type SheetDocument } from './model'

const savedDocumentSchema = z.object({
  id: z.string(),
  name: z.string().default('Untitled sheet'),
  document: z.custom<SheetDocument>(),
  updatedAt: z.string(),
})

export type SavedDocument = z.infer<typeof savedDocumentSchema>

export const savedDocuments = createCollection(
  localStorageCollectionOptions({
    id: 'saved-documents',
    storageKey: 'dungeon-sheets:docs',
    getKey: (entry) => entry.id,
    schema: savedDocumentSchema,
  }),
)

export function createSavedDocument(name: string, document: SheetDocument) {
  const id = makeId()

  savedDocuments.insert({ id, name, document: structuredClone(document), updatedAt: new Date().toISOString() })

  return id
}

export function updateSavedDocument(id: string, document: SheetDocument) {
  savedDocuments.update(id, (draft) => {
    draft.document = structuredClone(document)
    draft.updatedAt = new Date().toISOString()
  })
}

export function renameSavedDocument(id: string, name: string) {
  savedDocuments.update(id, (draft) => {
    draft.name = name
  })
}

export function duplicateSavedDocument(entry: SavedDocument) {
  return createSavedDocument(`${entry.name} copy`, entry.document)
}

export function deleteSavedDocument(id: string) {
  savedDocuments.delete(id)
}
