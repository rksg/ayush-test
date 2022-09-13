import { BrowserRouter } from 'react-router-dom'

import { fakeIncident1 }         from '@acx-ui/analytics/utils'
import { store }                 from '@acx-ui/store'
import { mockAutoSizer, render } from '@acx-ui/test-utils'

import { ChartsData } from '../services'
import { Api }        from '../services'

import { IncidentChart } from './IncidentChart'

const expectedResult = {
  incidentCharts: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    eap: [1, 1]
  },
  relatedIncidents: [{
    id: '07965e24-84ba-48a5-8200-f310f8197f40',
    severity: 0.5,
    code: 'eap',
    startTime: '2022-04-07T12:15:00.000Z',
    endTime: '2022-04-07T13:15:00.000Z'
  }]
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('IncidentChart', () => {
  mockAutoSizer()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <IncidentChart incident={fakeIncident1} data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
