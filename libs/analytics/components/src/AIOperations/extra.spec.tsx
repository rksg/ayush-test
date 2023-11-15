import { BrowserRouter } from 'react-router-dom'

import { render } from '@acx-ui/test-utils'

import { NoAiOpsLicense, NoRecommendationData } from './extra'

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
