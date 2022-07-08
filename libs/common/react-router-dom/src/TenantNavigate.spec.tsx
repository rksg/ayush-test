import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { TenantNavigate } from './TenantNavigate'

jest.mock('./useTenantLink', () => ({
  useTenantLink: to => `prefixed/${to}`
}))
jest.mock('react-router-dom', () => ({
  Navigate: ({ to, children }) => <div>{to} - {children}</div>
}))

describe('TenantNavigate', () => {
  it('should render a Navigate with correct path', () => {
    render(<TenantNavigate to='some/url'>link text</TenantNavigate>)
    expect(screen.getByText('prefixed/some/url - link text')).toBeVisible()
  })
})
