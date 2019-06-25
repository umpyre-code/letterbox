import { Paper } from '@material-ui/core'
import { EditorState } from 'draft-js'
import {
  BlockquoteButton,
  BoldButton,
  CodeBlockButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineThreeButton,
  HeadlineTwoButton,
  ItalicButton,
  OrderedListButton,
  UnderlineButton,
  UnorderedListButton
} from 'draft-js-buttons'
import createInlineToolbarPlugin, { Separator } from 'draft-js-inline-toolbar-plugin'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createMarkdownPlugin from 'draft-js-markdown-plugin'
import Editor from 'draft-js-plugins-editor'
import createPrismPlugin from 'draft-js-prism-plugin'
import 'draft-js/dist/Draft.css'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import * as React from 'react'

const inlineToolbarPlugin = createInlineToolbarPlugin()
const { InlineToolbar } = inlineToolbarPlugin

const editorPlugins = [
  inlineToolbarPlugin,
  createPrismPlugin({
    prism: Prism
  }),
  createMarkdownPlugin(),
  createLinkifyPlugin()
]

const ComposeForm = () => {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())

  return (
    <Paper>
      <Editor
        editorState={editorState}
        plugins={editorPlugins}
        onChange={(updatedEditorState: EditorState) => {
          setEditorState(updatedEditorState)
          // console.log(htmlToMarkdown(stateToHTML(updatedEditorState.getCurrentContent())))
        }}
        placeholder="Say something nice :)"
      />
      <InlineToolbar>
        {// may be use React.Fragment instead of div to improve perfomance after React 16
        externalProps => (
          <React.Fragment>
            <HeadlineOneButton {...externalProps} />
            <HeadlineTwoButton {...externalProps} />
            <HeadlineThreeButton {...externalProps} />
            <Separator {...externalProps} />
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <UnderlineButton {...externalProps} />
            <Separator {...externalProps} />
            <CodeButton {...externalProps} />
            <UnorderedListButton {...externalProps} />
            <OrderedListButton {...externalProps} />
            <BlockquoteButton {...externalProps} />
            <CodeBlockButton {...externalProps} />
          </React.Fragment>
        )}
      </InlineToolbar>
    </Paper>
  )
}

export default ComposeForm
