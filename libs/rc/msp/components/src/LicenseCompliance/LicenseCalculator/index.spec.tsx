import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import LicenseCalculatorCard from '.'

describe('LicenseCompliance', () => {
  it('should render LicenseCalculatorCard with default props', async () => {
    const props = {
      title: 'Test Title',
      subTitle: 'Test Subtitle',
      footerContent: <div>Footer Content</div>
    }
    render(<LicenseCalculatorCard {...props} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Footer Content')).toBeInTheDocument()

    const tabMaxLiceses = screen.getByRole('tab', { name: 'Max Licenses' })
    expect(tabMaxLiceses.getAttribute('aria-selected')).toBeTruthy()
    const tabMaxPeriod = screen.getByRole('tab', { name: 'Max Period' })
    expect(tabMaxPeriod.getAttribute('aria-selected')).toBe('false')
    await userEvent.click(tabMaxPeriod)
    expect(tabMaxPeriod.getAttribute('aria-selected')).toBe('true')
    expect(tabMaxLiceses.getAttribute('aria-selected')).toBe('false')
  })
})
