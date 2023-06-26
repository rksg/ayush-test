import { render, screen } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM } from './__fixtures__'
import { transformDetailsResponse } from './services'
import { StatusTrail }              from './statusTrail'

describe('RecommendationDetails Status Trail', () => {
  it('should render correctly with valid data', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<StatusTrail details={crrmDetails} />)
    expect(await screen.findAllByText('New')).toHaveLength(1)
    expect(await screen.findAllByText('Applied')).toHaveLength(14)
    expect(await screen.findAllByText('Apply In Progress')).toHaveLength(14)
    expect(await screen.findAllByText('Scheduled')).toHaveLength(15)
  })
})