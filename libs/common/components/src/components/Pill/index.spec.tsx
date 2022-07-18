import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Pill } from '.'

describe('Pill', () => {
  it('renders negative trend', () => {
    const { asFragment } = render(<Pill value='-123' trend='negative' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders positive trend', () => {
    const { asFragment } = render(<Pill value='123' trend='positive' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders no trend', () => {
    const { asFragment } = render(<Pill value='0' trend='none' />)
    expect(asFragment()).toMatchSnapshot()
  })
})
