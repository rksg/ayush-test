import { fakeIncident1 }         from '@acx-ui/analytics/utils'
import { store }                 from '@acx-ui/store'
import { mockAutoSizer, render } from '@acx-ui/test-utils'

import { ChartsData } from '../services'
import { Api }        from '../services'

import { ClientCountChart } from './ClientCountChart'

const expectedResult = {
  clientCountCharts: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    newClientCount: [1, 2, 3, 4, 5],
    impactedClientCount: [6, 7, 8, 9, 10],
    connectedClientCount: [11, 12, 13, 14, 15]
  }
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('ClientCountChart', () => {
  mockAutoSizer()
  it('should match snapshot', () => {
    const { asFragment } = render(
      <ClientCountChart incident={fakeIncident1} data={expectedResult}/>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
