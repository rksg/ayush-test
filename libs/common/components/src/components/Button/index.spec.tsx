import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { IntlProvider }   from 'react-intl'

import { Button, DisabledButton } from '.'

describe('Button', () => {
  it('should render default button', () => {
    const { asFragment } = render(<Button>Button</Button>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render primary button', () => {
    const { asFragment } = render(<Button type='primary'>Button</Button>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render secondary button', () => {
    const { asFragment } = render(<Button type='secondary'>Button</Button>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('DisabledButton', () => {
  it('should render disabled button with tooltip', async () => {
    const { asFragment } = render(
      <IntlProvider locale='en'>
        <DisabledButton>Button</DisabledButton>
      </IntlProvider>)
    await userEvent.hover(screen.getAllByText((_, element) => {
      return element!.tagName.toLowerCase() === 'span'
    })[0])
    await screen.findByRole('tooltip', { hidden: true })
    expect(asFragment()).toMatchSnapshot()
  })
})
