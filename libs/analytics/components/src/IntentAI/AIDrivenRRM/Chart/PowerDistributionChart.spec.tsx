import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import {
  mockedApPowerDistribution,
  mockedIntentCRRM,
  mockedIntentCRRMnew
} from '../__tests__/fixtures'

import PowerDistributionChart from './PowerDistributionChart'

describe('PowerDistributionChart', () => {
  it('renders the chart with data', async () => {
    mockGraphqlQuery(intentAIUrl, 'ApPowerDistribution', {
      data: { intent: { apPowerDistribution: mockedApPowerDistribution } }
    })
    const { asFragment } = render(
      <Provider>
        <PowerDistributionChart {...mockedIntentCRRM} />
      </Provider>
    )
    expect(await screen.findByText('Power Transmission')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('renders NoData component when there is no data', async () => {
    mockGraphqlQuery(intentAIUrl, 'ApPowerDistribution', {
      data: { intent: { apPowerDistribution: [] } }
    })
    const { asFragment } = render(
      <Provider>
        <PowerDistributionChart {...mockedIntentCRRMnew} />
      </Provider>
    )
    expect(await screen.findByText('Power Transmission')).toBeVisible()
    expect(screen.getByText('No data to display')).toBeInTheDocument()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
  })
})
