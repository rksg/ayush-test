import { BrowserRouter, Path } from 'react-router-dom'

import {
  fakeIncident1,
  fakeIncident
} from '@acx-ui/analytics/utils'
import { store }  from '@acx-ui/store'
import { render } from '@acx-ui/test-utils'

import { ChartsData, Api } from '../services'

import { FailureChart, onMarkedAreaClick, getMarkers } from './FailureChart'

const expectedResult = {
  failureChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    eap: [1, 1]
  },
  relatedIncidents: [
    fakeIncident({
      id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
      severity: 0.5,
      code: 'eap-failure',
      startTime: '2022-07-19T05:15:00.000Z',
      endTime: '2022-07-20T02:42:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    }),
    fakeIncident({
      id: '07965e24-84ba-48a5-8200-f310f8197f41',
      severity: 0.8,
      code: 'eap-failure',
      startTime: '2022-04-08T12:15:00.000Z',
      endTime: '2022-04-08T13:15:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    })
  ]
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('FailureChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <FailureChart incident={fakeIncident1} data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  describe('onMarkedAreaClick', () => {
    it('navigate to clicked incident', () => {
      const navigate = jest.fn()
      const [incident, relatedIncident] = expectedResult.relatedIncidents
      const basePath = { pathname: '/analytics/incidents/' }

      onMarkedAreaClick(navigate, basePath as Path, incident)(relatedIncident)

      expect(navigate).toBeCalledTimes(1)
      expect(navigate).toBeCalledWith({
        ...basePath,
        pathname: `${basePath.pathname}/${relatedIncident.id}`
      })
    })

    it('does not navigate to same incident', () => {
      const navigate = jest.fn()
      const [incident] = expectedResult.relatedIncidents
      const basePath = { pathname: '/analytics/incidents/' }

      onMarkedAreaClick(navigate, basePath as Path, incident)(incident)

      expect(navigate).not.toBeCalled()
    })
  })

  it('should handle markAreaProps', () => {
    const { relatedIncidents } = expectedResult
    expect(getMarkers(relatedIncidents, relatedIncidents[0])).toMatchSnapshot()
  })
})
