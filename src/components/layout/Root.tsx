import * as React from 'react'
import styled from '../../utils/styled'

interface RootProps {
  className?: string
}

const Root: React.SFC<RootProps> = ({ children }) => <Wrapper>{children}</Wrapper>

export default Root

const Wrapper = styled('div')`
  font-family: 'Cooper Hewitt', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto;
  font-weight: 600;
`
