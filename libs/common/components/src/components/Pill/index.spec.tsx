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
  it('renders P1', () => {
    const { asFragment } = render(<Pill value='P1' trend='P1' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders P2', () => {
    const { asFragment } = render(<Pill value='P2' trend='P2' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders P3', () => {
    const { asFragment } = render(<Pill value='P3' trend='P3' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders P4', () => {
    const { asFragment } = render(<Pill value='P4' trend='P4' />)
    expect(asFragment()).toMatchSnapshot()
  })
})
