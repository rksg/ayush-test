import { Path } from 'react-router-dom'

import { fakeIncident } from '@acx-ui/analytics/utils'

import { onMarkAreaClick, getMarkers } from './incidentTimeSeriesMarker'

const incidnets = [
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

describe('onMarkedAreaClick', () => {
  it('navigate to clicked incident', () => {
    const navigate = jest.fn()
    const [incident, relatedIncident] = incidnets
    const basePath = { pathname: '/analytics/incidents/' }
    onMarkAreaClick(navigate, basePath as Path, incident)(relatedIncident)
    expect(navigate).toBeCalledTimes(1)
    expect(navigate).toBeCalledWith({
      ...basePath,
      pathname: `${basePath.pathname}/${relatedIncident.id}`
    })
  })
  it('does not navigate to same incident', () => {
    const navigate = jest.fn()
    const [incident] = incidnets
    const basePath = { pathname: '/analytics/incidents/' }
    onMarkAreaClick(navigate, basePath as Path, incident)(incident)
    expect(navigate).not.toBeCalled()
  })
})

describe('getMarkers', () => {
  it('should handle markAreaProps', () => {
    expect(getMarkers(incidnets, incidnets[0])).toMatchSnapshot()
  })
})
