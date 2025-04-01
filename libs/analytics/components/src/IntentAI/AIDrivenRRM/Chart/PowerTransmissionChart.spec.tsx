import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM, mockedIntentCRRMnew } from '../__tests__/fixtures'

import PowerTransmissionChart from './PowerTransmissionChart'

describe('PowerTransmi', () => {
  it('renders the chart with data', async () => {
    const { asFragment } = render(
      <Provider>
        <PowerTransmissionChart {...mockedIntentCRRM} />
      </Provider>
    )
    expect(await screen.findByText('Power Transmission')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('renders NoData component when there is no data', async () => {
    const { asFragment } = render(
      <Provider>
        <PowerTransmissionChart {...mockedIntentCRRMnew} />
      </Provider>
    )
    expect(await screen.findByText('Power Transmission')).toBeVisible()
    expect(screen.getByText('No data to display')).toBeInTheDocument()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
  })
})
