import { Paper } from '@material-ui/core'
import { EditorState } from 'draft-js'
import * as React from 'react'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

const toolbarConfig = {
  block: ['unordered-list-item', 'header-one', 'header-two', 'header-three'],
  inline: ['BOLD', 'UNDERLINE', 'ITALIC', 'hyperlink']
}

const ComposeForm = () => {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())

  return (
    <Paper>
      <Editor
        toolbarConfig={toolbarConfig}
        editorState={editorState}
        onEditorStateChange={(updatedEditorState: EditorState) => {
          setEditorState(updatedEditorState)
          // console.log(draftToMarkdown(convertToRaw(updatedEditorState.getCurrentContent())))
        }}
      />
    </Paper>
  )
}

export default ComposeForm
