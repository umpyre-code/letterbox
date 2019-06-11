import * as React from 'react'
import { ReactReduxContext } from 'react-redux'

import { ApplicationState } from '../store'

interface LayoutContainerProps {}

interface LayoutContainerRenderProps {
  render?: (props: LayoutContainerProps) => React.ReactNode
  children?: (props: LayoutContainerProps) => React.ReactNode
}

const LayoutContainer: React.FC<LayoutContainerRenderProps> = ({ render, children }) => {
  return (
    <ReactReduxContext.Consumer>
      {({ store }) => {
        const state: ApplicationState = store.getState()

        if (render) {
          return render({})
        }

        if (children) {
          return children({})
        }

        return null
      }}
    </ReactReduxContext.Consumer>
  )
}

export default LayoutContainer
