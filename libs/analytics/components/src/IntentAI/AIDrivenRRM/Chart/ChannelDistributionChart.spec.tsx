import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedAPChannelDistribution, mockedIntentCRRM, mockedIntentCRRMnew } from '../__tests__/fixtures'

import ChannelDistributionChart from './ChannelDistributionChart'

describe('ChannelDistributionChart', () => {
  it('renders the chart with data', async () => {
    mockGraphqlQuery(intentAIUrl, 'APChannelDistribution', {
      data: { intent: { apChannelDistribution: mockedAPChannelDistribution } }
    })
    const { asFragment } = render(
      <Provider>
        <ChannelDistributionChart {...mockedIntentCRRM} />
      </Provider>
    )
    expect(await screen.findByText('Channel Distribution')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('renders NoData component when there is no data', async () => {
    mockGraphqlQuery(intentAIUrl, 'APChannelDistribution', {
      data: { intent: { apChannelDistribution: [] } }
    })
    const { asFragment } = render(
      <Provider>
        <ChannelDistributionChart {...mockedIntentCRRMnew} />
      </Provider>
    )
    expect(await screen.findByText('Channel Distribution')).toBeVisible()
    expect(screen.getByText('No data to display')).toBeInTheDocument()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
  })
})
