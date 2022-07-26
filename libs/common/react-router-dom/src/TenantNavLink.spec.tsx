import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { TenantNavLink } from './TenantNavLink'

jest.mock('./useTenantLink', () => ({
  useTenantLink: to => `prefixed/${to}`
}))
jest.mock('react-router-dom', () => ({
  NavLink: ({ to, children }) => <div>{to} - {children}</div>
}))

describe('TenantNavLink', () => {
  it('should render a NavLink with correct path', () => {
    render(<TenantNavLink to='some/url'>link text</TenantNavLink>)
    expect(screen.getByText('prefixed/some/url - link text')).toBeVisible()
  })
})
