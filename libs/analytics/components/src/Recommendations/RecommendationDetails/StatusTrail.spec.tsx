import { render, screen } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM }                        from './__tests__/fixtures'
import { RecommendationDetails, transformDetailsResponse } from './services'
import { StatusTrail }                                     from './StatusTrail'

describe('RecommendationDetails Status Trail', () => {
  it('should render correctly with valid data', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<StatusTrail details={crrmDetails} />)
    expect(await screen.findAllByText('New')).toHaveLength(1)
    expect(await screen.findAllByText('Applied')).toHaveLength(14)
    expect(await screen.findAllByText('Apply In Progress')).toHaveLength(14)
    expect(await screen.findAllByText('Scheduled')).toHaveLength(15)
  })

  it('should render correctly with apply cancel', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM,
      statusTrail: [
        {
          status: 'applied',
          createdAt: '2023-06-25T06:05:13.243Z'
        },
        {
          status: 'revertscheduled',
          createdAt: '2023-06-26T06:05:13.243Z'
        }
      ]
    } as unknown as RecommendationDetails)
    render(<StatusTrail details={crrmDetails} />)
    expect(await screen.findAllByText('Applied (Revert Canceled)')).toHaveLength(1)
  })

  it('should render correctly with new apply cancel', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM,
      statusTrail: [
        {
          status: 'new',
          createdAt: '2023-06-25T06:05:13.243Z'
        },
        {
          status: 'applyscheduled',
          createdAt: '2023-06-26T06:05:13.243Z'
        }
      ]
    } as unknown as RecommendationDetails)
    render(<StatusTrail details={crrmDetails} />)
    expect(await screen.findAllByText('New (Apply Canceled)')).toHaveLength(1)
  })


  it('should render correctly with unknown status', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM,
      statusTrail: [
        {
          status: 'unknown',
          createdAt: '2023-06-25T06:05:13.243Z'
        }
      ]
    } as unknown as RecommendationDetails)
    render(<StatusTrail details={crrmDetails} />)
    expect(await screen.findAllByText('Unknown')).toHaveLength(1)
  })
})
