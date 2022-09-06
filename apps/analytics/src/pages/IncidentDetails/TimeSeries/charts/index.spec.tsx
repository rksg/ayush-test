import { fakeIncident1 }                 from '@acx-ui/analytics/utils'
import { store }                         from '@acx-ui/store'
import { mockAutoSizer, render, screen } from '@acx-ui/test-utils'

import { ChartsData } from '../services'
import { Api }        from '../services'

import { AttemptAndFailureChart } from './AttemptAndFailureChart'
import { ClientCountChart }       from './ClientCountChart'
import { IncidentChart }          from './IncidentChart'

const expectedResult = {
  incidentChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    radius: [1, 1]
  },
  relatedIncidents: {
    id: '07965e24-84ba-48a5-8200-f310f8197f40',
    severity: 0.5,
    code: 'radius',
    startTime: '2022-04-07T12:15:00.000Z',
    endTime: '2022-04-07T13:15:00.000Z'
  },
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
  },
  attemptAndFailureCharts: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z'
    ],
    failureCount: [1, 2],
    totalFailureCount: [1, 2],
    attemptCount: [1, 2]
  }
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('IncidentChart', () => {
  mockAutoSizer()
  it('should match snapshot', () => {
    const { asFragment } = render(
      <IncidentChart incident={fakeIncident1} data={expectedResult}/>
    )
    expect(screen.getByText(/failures/i).textContent).toEqual('EAP Failures')
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('AttemptAndFailureChart', () => {
  mockAutoSizer()
  it('should match snapshot', async () => {
    const { asFragment } = render(
      <AttemptAndFailureChart incident={fakeIncident1} data={expectedResult}/>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('ClientCountChart', () => {
  mockAutoSizer()
  it('should match snapshot', () => {
    const { asFragment } = render(
      <ClientCountChart incident={fakeIncident1} data={expectedResult}/>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
