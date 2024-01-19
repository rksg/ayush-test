import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

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
    const { asFragment } = render(<Button type='primary'>Button</Button>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('DisabledButton', () => {
  it('should render disabled button with tooltip', async () => {
    const { asFragment } = render(
      <DisabledButton title='Not available'>Button</DisabledButton>
    )
    await userEvent.hover(screen.getAllByText((_, element) => {
      return element!.tagName.toLowerCase() === 'span'
    })[0])
    await screen.findByRole('tooltip', { hidden: true })
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render disabled button without', async () => {
    const { asFragment } = render(<DisabledButton>Button</DisabledButton>)
    await userEvent.hover(screen.getAllByText((_, element) => {
      return element!.tagName.toLowerCase() === 'span'
    })[0])
    expect(asFragment()).toMatchSnapshot()
  })
})
