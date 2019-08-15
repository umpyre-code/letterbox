import { Box } from '@material-ui/core'
import { EditorState } from 'draft-js'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createMarkdownPlugin from 'draft-js-markdown-plugin'
import PluginEditor from 'draft-js-plugins-editor'
import createPrismPlugin from 'draft-js-prism-plugin'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import * as React from 'react'
import './Draft.css'
import { DraftInlineToolbar, inlineToolbarPlugin } from './DraftInlineToolbar'

const editorPlugins = [
  inlineToolbarPlugin,
  createPrismPlugin({
    prism: Prism
  }),
  createMarkdownPlugin(),
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
        spellCheck={true}
        readOnly={readOnly}
      />
      <DraftInlineToolbar />
    </Box>
  )
}

Editor.defaultProps = {
  readOnly: false
}
