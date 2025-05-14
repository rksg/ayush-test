import { render, screen } from '@testing-library/react'
import { IntlProvider }   from 'react-intl'

import SecretFieldInput from './SecretFieldInput'

const renderWithIntl = (component: JSX.Element) => {
  return render(<IntlProvider locale='en'>{component}</IntlProvider>)
}

describe('SecretFieldInput', () => {
  it('should render password input with no placeholder when hasPlaceholder is false', () => {
    renderWithIntl(<SecretFieldInput hasPlaceholder={false} data-testid='testid'/>)
    const input = screen.getByTestId('testid')
    expect(input.getAttribute('placeholder')).toBeNull()
  })

  it('should render password input with correct placeholder when hasPlaceholder is true', () => {
    renderWithIntl(<SecretFieldInput hasPlaceholder data-testid='testid' />)
    const input = screen.getByTestId('testid')
    expect(input.getAttribute('placeholder')).toBe('Leave blank to remain unchanged')
  })

  it('should render text area with no placeholder when hasPlaceholder is false', () => {
    renderWithIntl(
      <SecretFieldInput.TextArea hasPlaceholder={false} data-testid='testid' />
    )
    const textarea = screen.getByTestId('testid')
    expect(textarea.getAttribute('placeholder')).toBeNull()
  })

  it('should render text area with correct placeholder when hasPlaceholder is true', () => {
    renderWithIntl(
      <SecretFieldInput.TextArea hasPlaceholder data-testid='testid' />
    )
    const textarea = screen.getByTestId('testid')
    expect(textarea.getAttribute('placeholder')).toBe('Leave blank to remain unchanged')
  })
})

