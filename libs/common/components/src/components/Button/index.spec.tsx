import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Button } from '.'

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
