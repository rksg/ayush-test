import { BrowserRouter, Path } from 'react-router-dom'

import { fakeIncident1 }        from '@acx-ui/analytics/utils'
import { store }                from '@acx-ui/store'
import { mockDOMWidth, render } from '@acx-ui/test-utils'

import { ChartsData, Api } from '../services'

import { IncidentChart, onMarkedAreaClick, markAreaProps } from './IncidentChart'

const expectedResult = {
  incidentCharts: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    eap: [1, 1]
  },
  relatedIncidents: [
    {
      id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
      severity: 0.5,
      code: 'eap',
      startTime: '2022-07-19T05:15:00.000Z',
      endTime: '2022-07-20T02:42:00.000Z'
    },
    {
      id: '07965e24-84ba-48a5-8200-f310f8197f41',
      severity: 0.8,
      code: 'eap',
      startTime: '2022-04-08T12:15:00.000Z',
      endTime: '2022-04-08T13:15:00.000Z'
    }
  ]
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('IncidentChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <IncidentChart incident={fakeIncident1} data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should handle onMarkedAreaClick', () => {
    const navigate = jest.fn()
    const relatedIncidents = expectedResult.relatedIncidents
    const props = {
      startTime: fakeIncident1.startTime,
      endTime: fakeIncident1.endTime
    }
    const basePath = { pathname: '/analytics/incidents/' }

    expect(navigate).toBeCalledTimes(0)

    onMarkedAreaClick(navigate, basePath as Path, relatedIncidents)(props)

    expect(navigate).toBeCalledTimes(1)
    expect(navigate).toBeCalledWith({
      ...basePath,
      pathname: `${basePath.pathname}/${relatedIncidents[0].id}`
    })
  })

  it('should handle markAreaProps', () => {
    const relatedIncidents = expectedResult.relatedIncidents
    expect(markAreaProps(relatedIncidents, fakeIncident1)).toMatchSnapshot()
  })
})
