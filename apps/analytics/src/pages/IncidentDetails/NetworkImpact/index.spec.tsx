import { dataApiURL }                                                  from '@acx-ui/analytics/services'
import { IncidentDetailsProps }                                        from '@acx-ui/analytics/utils'
import { Provider, store }                                             from '@acx-ui/store'
import { mockGraphqlQuery, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'


import { donutChartsApi } from './services'

import { NetworkImpact } from '.'

describe('NetworkImpact', () => {
  const props ={
    incident: { id: 'id', metadata: { dominant: { } } } as IncidentDetailsProps,
    charts: [ 'WLAN', 'radio', 'reason', 'clientManufacturer']
  }
  it('should match snapshot', async () => {
    store.dispatch(donutChartsApi.util.resetApiState())
    const expectedResult = { incident: {
      ssids: { count: 2, data: [
        { key: 'ssid1', value: 2 }, { key: 'ssid2', value: 1 }
      ] },
      reasonCodes: { count: 2, data: [
        { key: 'CCD_REASON_AAA_AUTH_FAIL', value: 2 }
      ] },
      radios: { count: 2, data: [
        { key: '2.4', value: 1 }, { key: '5', value: 1 }
      ] },
      manufacturer: { count: 2, data: [
        { key: 'manufacturer1', value: 1 }, { key: 'manufacturer2', value: 1 }
      ] }
    } }
    mockGraphqlQuery(dataApiURL, 'DonutCharts', {
      data: expectedResult
    })
    const { asFragment } = render(<Provider><NetworkImpact {...props}/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
})
