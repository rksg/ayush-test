import '@testing-library/jest-dom'
import { cssStr }                    from '@acx-ui/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  getFormattedToFunnel,
  valueFormatter
} from './config'
import { FunnelChart } from './funnelChart'

const stages = {
  authFailure: 228.46716757166308,
  assoFailure: 252.04659838138593,
  eapFailure: 352.08455161065757,
  radiusFailure: 252.82345132743362,
  dhcpFailure: 97.25188470066519
}
const colors = [
  cssStr('--acx-accents-blue-80'),
  cssStr('--acx-accents-blue-70'),
  cssStr('--acx-accents-blue-60'),
  cssStr('--acx-accents-blue-55'),
  cssStr('--acx-accents-blue-50')
]
describe('Funnel Chart', () => {
  it('should render ttc FunnelChart', async () => {
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc',stages )}
          colors={colors}
          selectedStage={'dhcpFailure'}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(await screen.findByText('802.11 Auth.: 19.32%(228 ms)')).toBeVisible()
  })
  it('should show No data for empty stages', async () => {
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={[]}
          colors={colors}
          selectedStage={null}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(await screen.findByText('No data')).toBeVisible()
  })
  it('should not render Label for an empty stage', async () => {
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc',{ ...stages, dhcpFailure: null } )}
          colors={colors}
          selectedStage={null}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(await screen.findByText('802.11 Auth.: 21.05%(228 ms)')).toBeVisible()
    expect(screen.queryByText('DHCP')).toBe(null)
  })
  it('should handle onClick', async () => {
    const onClick = jest.fn()
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc',stages )}
          colors={colors}
          selectedStage={'dhcpFailure'}
          onSelectStage={onClick}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    const label = await screen.findByText('802.11 Auth.: 19.32%(228 ms)')
    expect(label).toBeVisible()
    fireEvent.click(label)
    expect(onClick).toBeCalledWith(123.64800000000001, 'Authentication')
  })
})


