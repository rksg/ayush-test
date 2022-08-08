import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { TrendPill, SeverityPill } from '.'

describe('TrendPill', () => {
  it('renders negative trend', () => {
    const { asFragment } = render(<TrendPill value='-123' trend='negative' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders positive trend', () => {
    const { asFragment } = render(<TrendPill value='123' trend='positive' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders no trend', () => {
    const { asFragment } = render(<TrendPill value='0' trend='none' />)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('SeverityPill', () => {
  it('renders P1', () => {
    const { asFragment } = render(<SeverityPill severity='P1' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders P2', () => {
    const { asFragment } = render(<SeverityPill severity='P2' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders P3', () => {
    const { asFragment } = render(<SeverityPill severity='P3' />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders P4', () => {
    const { asFragment } = render(<SeverityPill severity='P4' />)
    expect(asFragment()).toMatchSnapshot()
  })
})

