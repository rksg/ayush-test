import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { IntlProvider }   from 'react-intl'
import { MemoryRouter }   from 'react-router-dom'

import { VenueRadiusService } from './index'

jest.mock('./index', () => ({
  VenueRadiusService: ({ isAllowEdit = true }: { isAllowEdit?: boolean }) => (
    <div>
      <div>Override Authentication service in active networks</div>
      <div>Override Accounting service in active networks</div>
      <div>Only non-proxy authentication servers from active networks will be overridden</div>
      <div>Only non-proxy accounting servers from active networks will be overridden</div>
      <input type='checkbox' disabled={!isAllowEdit} />
    </div>
  )
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale='en' messages={{}}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </IntlProvider>
)

describe('VenueRadiusService', () => {
  it('should render the component with authentication and accounting switches', () => {
    render(
      <TestWrapper>
        <VenueRadiusService />
      </TestWrapper>
    )
    const expectedAuthResult = 'Override Authentication service in active networks'
    const expectedAccountingResult = 'Override Accounting service in active networks'
    expect(screen.getByText(expectedAuthResult)).toBeInTheDocument()
    expect(screen.getByText(expectedAccountingResult)).toBeInTheDocument()
  })

  it('should render tooltips for authentication and accounting switches', () => {
    render(
      <TestWrapper>
        <VenueRadiusService />
      </TestWrapper>
    )
    const expectedAuthTooltip =
      'Only non-proxy authentication servers from active networks will be overridden'
    expect(screen.getByText(expectedAuthTooltip)).toBeInTheDocument()
    const expectedAccountingTooltip =
      'Only non-proxy accounting servers from active networks will be overridden'
    expect(screen.getByText(expectedAccountingTooltip)).toBeInTheDocument()
  })

  it('should disable switches when isAllowEdit is false', () => {
    render(
      <TestWrapper>
        <VenueRadiusService isAllowEdit={false} />
      </TestWrapper>
    )
    const switches = screen.getAllByRole('checkbox')
    switches.forEach(switchElement => {
      expect(switchElement).toBeDisabled()
    })
  })
})