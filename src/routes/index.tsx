import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { editorStore } from '#/editor/store'

import { EditorCanvas } from '#/editor/canvas'
import { Inspector } from '#/editor/inspector'
import { useEditorKeyboard } from '#/editor/keyboard'
import { Toolbar } from '#/editor/toolbar'
import { Topbar } from '#/editor/topbar'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  useEditorKeyboard()
  const showProperties = useStore(editorStore, (state) => state.showProperties)

  return (
    <main className={`editor-shell${showProperties ? '' : ' properties-hidden'}`}>
      <Toolbar />
      <Topbar />
      <EditorCanvas />
      {showProperties && <Inspector />}
    </main>
  )
}
