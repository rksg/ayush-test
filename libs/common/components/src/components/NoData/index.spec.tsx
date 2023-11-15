import { BrowserRouter } from 'react-router-dom'

import { render } from '@acx-ui/test-utils'

import { NoActiveContent, NoActiveData, NoAiOpsLicense, NoData, NoRecommendationData } from '.'

describe('NoData', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoData/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoData text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoActiveData', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoActiveData/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoActiveData text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoActiveContent', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoActiveContent/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoActiveContent text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoRecommendationData', () => {
  it('should render correctly with the prop', () => {
    // eslint-disable-next-line max-len
    const { asFragment } = render(<NoRecommendationData text='Your network is already running in an optimal configuration and we dont have any AI Operations to recommend recently.'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoAiOpsLicense', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<BrowserRouter>
      {/* eslint-disable-next-line max-len */}
      <NoAiOpsLicense text='RUCKUS AI cannot analyse your zone due to inadequate licenses. Please ensure you have licenses fully applied for the zone for AI Operations optimizations.'/>
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
})
