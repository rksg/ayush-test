import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { NoRRMLicense, NoRecommendationData } from './extra'

describe('NoRecommendationData', () => {
  it('should render correctly with the prop', () => {
    // eslint-disable-next-line max-len
    const { asFragment } = render(<NoRecommendationData
      details='This feature is a centralized algorithm that runs in the
        RUCKUS Analytics cloud and guarantees zero interfering links
        for the access points (APs) managed by SmartZone controllers,
        whenever theoretically achievable thus minimizing co-channel
        interference to the lowest level possible.'
      text='Currently RUCKUS AI cannot provide RRM optimizations
        as zones are not found on your network.'
    />)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoRRMLicense', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<BrowserRouter>
      {/* eslint-disable-next-line max-len */}
      <NoRRMLicense
        text='This feature is a centralized algorithm that runs in the
          RUCKUS Analytics cloud and guarantees zero interfering links
          for the access points (APs) managed by SmartZone controllers,
          whenever theoretically achievable thus minimizing co-channel
          interference to the lowest level possible.'
        details='Currently RUCKUS AI cannot optimize your zone(s)
          for RRM due to inadequate licenses.'
      />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
    const button = screen.getByRole('button', {
      name: /update my licenses/i
    })
    fireEvent.click(button)
  })
})
