import {
  BlockquoteButton,
  BoldButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  ItalicButton,
  OrderedListButton,
  UnorderedListButton
} from 'draft-js-buttons'
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin'
import * as React from 'react'

export const inlineToolbarPlugin = createInlineToolbarPlugin()
const { InlineToolbar } = inlineToolbarPlugin

export const DraftInlineToolbar = () => (
  <InlineToolbar>
    {(externalProps: any) => (
      <React.Fragment>
        <HeadlineOneButton {...externalProps} />
        <HeadlineTwoButton {...externalProps} />
        <BoldButton {...externalProps} />
        <ItalicButton {...externalProps} />
        <UnorderedListButton {...externalProps} />
        <OrderedListButton {...externalProps} />
        <BlockquoteButton {...externalProps} />
      </React.Fragment>
    )}
  </InlineToolbar>
)
