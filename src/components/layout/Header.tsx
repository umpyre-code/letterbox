import * as React from 'react'
import { NavLink } from 'react-router-dom'
import styled from '../../utils/styled'
import LayoutContainer from '../../containers/LayoutContainer'
import Container from './Container'
import { css } from 'emotion'

interface HeaderProps {
  title: string
}

const Header: React.SFC<HeaderProps> = ({ title }) => (
  <Wrapper>
    <HeaderInner>
      <HeaderLeft>
        <Title>{title}</Title>
      </HeaderLeft>
      <HeaderNav>
        <HeaderNavLink exact to="/" activeClassName={HeaderLinkActive}>
          Home
        </HeaderNavLink>
        <HeaderNavLink to="/heroes" activeClassName={HeaderLinkActive}>
          Heroes
        </HeaderNavLink>
        <HeaderNavLink to="/teams" activeClassName={HeaderLinkActive}>
          Teams
        </HeaderNavLink>
      </HeaderNav>
      <HeaderRight>
        <p>Hello</p>
      </HeaderRight>
    </HeaderInner>
  </Wrapper>
)

export default Header

const Wrapper = styled('header')`
  padding: 0.5rem 1.5rem;
`

const HeaderInner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`

const HeaderLeft = styled('div')`
  padding-right: 1rem;
`

const HeaderNav = styled('nav')`
  flex: 1 1 auto;
  margin: 1rem 0;
`

const HeaderNavLink = styled(NavLink)`
  margin: 0 1rem;
`

const HeaderLinkActive = css`
  text-decoration: underline;
`

const HeaderRight = styled('div')`
  padding-left: 1rem;
`

const Title = styled('h2')`
  margin: 0;
  font-weight: 500;
`

const CurrentTheme = styled('span')`
  margin-right: 1rem;
`

const ThemeSwitcherButton = styled('button')`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover,
  &:focus {
    background-color: transparent;
  }
`
