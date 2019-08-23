import {
  BlockquoteButton,
  BoldButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  ItalicButton,
  OrderedListButton,
  UnorderedListButton,
  CodeBlockButton
} from 'draft-js-buttons'
import createToolbarPlugin from 'draft-js-static-toolbar-plugin'
import * as React from 'react'
import toolbarStyles from './ToolbarStyles.module.css'
import buttonStyles from './ButtonStyles.module.css'

export const staticToolbarPlugin = createToolbarPlugin({
  theme: { buttonStyles, toolbarStyles }
})
const { Toolbar } = staticToolbarPlugin

export function DraftToolbar() {
  return (
    <Toolbar>
      {externalProps => (
        <React.Fragment>
          <HeadlineOneButton {...externalProps} />
          <HeadlineTwoButton {...externalProps} />
          <BoldButton {...externalProps} />
          <ItalicButton {...externalProps} />
          <UnorderedListButton {...externalProps} />
          <OrderedListButton {...externalProps} />
          <BlockquoteButton {...externalProps} />
          <CodeBlockButton {...externalProps} />
        </React.Fragment>
      )}
    </Toolbar>
  )
}
