import { fakeIncident1 }                                               from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockImpactedSwitches, mockMemoryUtilization } from './__tests__/fixtures'
import { api }                                         from './services'

import { SwitchDetail } from '.'

describe('ChannelDistributionHeatMap', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    mockGraphqlQuery(dataApiURL, 'MemoryUtilization', mockMemoryUtilization)
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1, apCount: 10 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('ICX8200-24P Router')).toBeVisible()

    expect(await screen.findByText('Switch Model')).toBeVisible()
    expect(await screen.findByText('ICX8200-24P')).toBeVisible()

    expect(await screen.findByText('Switch MAC')).toBeVisible()
    expect(await screen.findByText('38:45:3B:3C:F1:20')).toBeVisible()

    expect(await screen.findByText('Switch Firmware Version')).toBeVisible()
    expect(await screen.findByText('RDR10020_b237')).toBeVisible()

    expect(await screen.findByText('Memory Utilization')).toBeVisible()
    expect(await screen.findByText('75%')).toBeVisible()
    expect(await screen.findByTestId('InformationOutlined')).toBeVisible()

    expect(await screen.findByText('Number of APs')).toBeVisible()
    expect(await screen.findByText('10')).toBeVisible()
  })
  it('should render empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', {
      data: { incident: { impactedSwitches: [] } } })
    mockGraphqlQuery(dataApiURL, 'MemoryUtilization', { data: { network: { hierarchyNode: {
      memoryUtilization: { time: [ '2024-02-01T07:00:00.000Z' ], utilization: [] } } } } })
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('Switch Model')).toBeVisible()
    expect(await screen.findByText('Switch MAC')).toBeVisible()
    expect(await screen.findByText('Switch Firmware Version')).toBeVisible()
    expect(await screen.findByText('Memory Utilization')).toBeVisible()
    expect(await screen.findByText('Number of APs')).toBeVisible()

    expect(await screen.findAllByText('--')).toHaveLength(5)
    expect(await screen.findByText('0%')).toBeVisible()
    expect(screen.queryByText('InformationOutlined')).toBeNull()
  })
})
