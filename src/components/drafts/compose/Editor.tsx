import { Box } from '@material-ui/core'
import { EditorState } from 'draft-js'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import PluginEditor from 'draft-js-plugins-editor'
import createPrismPlugin from 'draft-js-prism-plugin'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import * as React from 'react'
import './Draft.css'
import { DraftToolbar, staticToolbarPlugin } from './DraftToolbar'

const editorPlugins = [
  staticToolbarPlugin,
  createPrismPlugin({
    prism: Prism
  }),
  createLinkifyPlugin()
]

interface Props {
  placeholder: string
  editorState: EditorState
  onChange: (arg0: EditorState) => void
  readOnly?: boolean
}

export const Editor: React.FC<Props> = ({ placeholder, editorState, onChange, readOnly }) => {
  const editor = React.useRef(null)

  function focusEditor() {
    if (
      editor !== null &&
      editor !== undefined &&
      editor.current !== null &&
      editor.current !== undefined
    ) {
      editor.current.focus()
    }
  }

  React.useEffect(() => {
    focusEditor()
  }, [])

  return (
    <Box>
      <PluginEditor
        ref={editor}
        editorState={editorState}
        plugins={editorPlugins}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck
        readOnly={readOnly}
      />
      <DraftToolbar />
    </Box>
  )
}

Editor.defaultProps = {
  readOnly: false
}
