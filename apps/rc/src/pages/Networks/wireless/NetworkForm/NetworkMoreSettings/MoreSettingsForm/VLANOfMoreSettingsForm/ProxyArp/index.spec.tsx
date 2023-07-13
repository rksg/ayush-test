import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import ProxyArp from './index'


describe('ProxyArp', () => {
  it('should render ProxyArp Field correctly', function () {
    // GIVEN
    const enableVxLan = true
    // WHEN
    render(<ProxyArp enableVxLan={enableVxLan} />)
    // THEN
    expect(screen.getByTestId('ProxyArp')).toBeInTheDocument()
    expect(screen.getByText('Proxy ARP:')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('should be enabled when enableVxLan is false', function () {
    // GIVEN
    const enableVxLan = false
    // WHEN
    render(<ProxyArp enableVxLan={enableVxLan} />)
    // THEN
    expect(screen.getByRole('switch')).toBeEnabled()
  })
})
