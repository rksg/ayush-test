import '@testing-library/jest-dom'
import { ReactNode } from 'react'

import { render, screen } from '@acx-ui/test-utils'

import { MspTenantLink, TenantLink } from './TenantLink'

jest.mock('./useTenantLink', () => ({
  useTenantLink: (to: string) => `prefixed/${to}`
}))
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string, children: ReactNode }) => <div>{to} - {children}</div>
}))

describe('TenantLink', () => {
  it('should render a Link with correct path', () => {
    render(<TenantLink to='some/url'>link text</TenantLink>)
    expect(screen.getByText('prefixed/some/url - link text')).toBeVisible()
  })
  it('should render a MspLink with correct path', () => {
    render(<MspTenantLink to='some/url'>link text</MspTenantLink>)
    expect(screen.getByText('prefixed/some/url - link text')).toBeVisible()
  })
})
