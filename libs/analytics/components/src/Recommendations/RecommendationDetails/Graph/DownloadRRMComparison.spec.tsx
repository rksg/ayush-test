import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../__tests__/fixtures'

import { DownloadRRMComparison } from './DownloadRRMComparison'

describe('DownloadRRMComparison', () => {
  it('renders download button', async () => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    const params = { id: mockedRecommendationCRRM.id }
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    render(<DownloadRRMComparison />, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Download RRM comparison')).toBeVisible()
  })

  it('disable download button when monitoring', async () => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    const original = Date.now
    Date.now = jest.fn(() => new Date('2023-06-25T00:00:25.772Z').getTime())
    const params = { id: 'ad336e2a-63e4-4651-a9ac-65f5df4f4c47' }
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: { ...mockedRecommendationCRRM, status: 'applied' } }
    })
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    const { asFragment } =
        render(<DownloadRRMComparison />, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Download RRM comparison')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
    Date.now = original
  })
})
