import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { NoAiOpsLicense, NoRecommendationData } from './extra'

describe('NoRecommendationData', () => {
  it('should render correctly with the prop', () => {
    // eslint-disable-next-line max-len
    const { asFragment } = render(<NoRecommendationData />)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoAiOpsLicense', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<BrowserRouter>
      <NoAiOpsLicense />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
    const button = screen.getByRole('button', {
      name: /update my licenses/i
    })
    fireEvent.click(button)
  })
})
