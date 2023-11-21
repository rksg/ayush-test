import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { NoAiOpsLicense, NoRecommendationData } from './extra'

describe('NoRecommendationData', () => {
  it('should render correctly with the prop', () => {
    // eslint-disable-next-line max-len
    const { asFragment } = render(<NoRecommendationData
      text='Your network is already running in an optimal configuration and we dont
      have any AI Operations to recommend recently.'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoAiOpsLicense', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<BrowserRouter>
      <NoAiOpsLicense
        text='RUCKUS AI cannot analyse your zone due to inadequate licenses.
        Please ensure you have licenses fully applied for the zone for AI Operations
        optimizations.'
      />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
    const button = screen.getByRole('button', {
      name: /update my licenses/i
    })
    fireEvent.click(button)
  })
})
