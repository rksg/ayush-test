import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { TenantLink } from './TenantLink'

jest.mock('./useTenantLink', () => ({
  useTenantLink: to => `prefixed/${to}`
}))
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <div>{to} - {children}</div>
}))

describe('TenantLink', () => {
  it('should render a Link with correct path', () => {
    render(<TenantLink to='some/url'>link text</TenantLink>)
    expect(screen.getByText('prefixed/some/url - link text')).toBeVisible()
  })
})
