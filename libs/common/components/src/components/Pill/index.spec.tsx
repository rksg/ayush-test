import '@testing-library/jest-dom'

import { render } from '@acx-ui/test-utils'

import { TrendPill, SeverityPill, ProgressPill } from '.'

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

describe('ProgressPill', () => {
  it('should render correctly', () => {
    expect(render(<ProgressPill percent={0}/>).asFragment()).toMatchSnapshot()
    expect(render(<ProgressPill percent={33.33}/>).asFragment()).toMatchSnapshot()
    expect(render(<ProgressPill percent={50.00}/>).asFragment()).toMatchSnapshot()
    expect(render(<ProgressPill percent={66.6600}/>).asFragment()).toMatchSnapshot()
    expect(render(<ProgressPill percent={100}/>).asFragment()).toMatchSnapshot()
    expect(render(<ProgressPill percent={150}/>).asFragment()).toMatchSnapshot() //should show 100% for this case
  })
  it('should render with customized props', () => {
    const formatter = jest.fn((percent: number|undefined) => `${percent}% success`)
    expect(render(<ProgressPill percent={66.6600} formatter={formatter}/>).asFragment())
      .toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
    expect(formatter).toBeCalledWith(66.66, 0)
  })
})
