import moment from 'moment'

import { dataApiURL }                                                   from '@acx-ui/analytics/services'
import { fakeIncident }                                                 from '@acx-ui/analytics/utils'
import { Provider, store }                                              from '@acx-ui/store'
import { act, fireEvent, mockGraphqlQuery, render, renderHook, screen } from '@acx-ui/test-utils'

import { ImpactedAP, impactedApi, ImpactedClient } from './services'

import {
  durationOf,
  impactValues,
  IncidentAttributes,
  useDrawer
} from '.'

describe('durationOf', () => {
  const timezone = 'UTC'
  beforeEach(() => {
    moment.tz.setDefault(timezone)
  })
  afterEach(() => {
    moment.tz.setDefault(moment.tz.guess())
  })
  it('should return correct value', () => {
    expect(durationOf('2022-07-19T05:15:00.000Z','2022-07-20T02:42:00.000Z')).toEqual(77220000)
  })
})

describe('impactValues', () => {
  it('handles when incident has no client impact', () => {
    expect(impactValues('client', -1, -1)).toMatchSnapshot()
  })

  it('handles when incident is calculating', () => {
    expect(impactValues('client', null, null)).toMatchSnapshot()
  })

  it('handles clientCount = 0', () => {
    expect(impactValues('client', 0, 0)).toMatchSnapshot()
  })

  it('handles when incident has no client impact but has clinet count', () => {
    expect(impactValues('client', 128, 0)).toMatchSnapshot()
  })

  it('handles when incident has client impact', () => {
    expect(impactValues('client', 128, 55)).toMatchSnapshot()
  })

  it('formats impacted client count', () => {
    expect(impactValues('client', 1500, 1300)).toMatchSnapshot()
  })

  it('formats impacted ap count', () => {
    expect(impactValues('ap', 1, 1)).toMatchSnapshot()
  })
})

describe('useDrawer', () => {
  it('should return correct value', () => {
    const { result } = renderHook(() => useDrawer(false))
    expect(result.current.visible).toEqual(false)
  })
  it('should set visible when onOpen', () => {
    const { result } = renderHook(() => useDrawer(false))
    act(() => {
      result.current.onOpen('ap')
    })
    expect(result.current.visible).toEqual('ap')
  })
  it('should set visible when onClose', () => {
    const { result } = renderHook(() => useDrawer(false))
    act(() => {
      result.current.onClose()
    })
    expect(result.current.visible).toEqual(false)
  })
})

describe('IncidentAttributes', () => {
  const timezone = 'UTC'
  beforeEach(() => {
    moment.tz.setDefault(timezone)
  })
  afterEach(() => {
    moment.tz.setDefault(moment.tz.guess())
  })
  const attributeList = [
    'clientImpactCount',
    'apImpactCount',
    'incidentCategory',
    'incidentSubCategory',
    'type',
    'scope',
    'duration',
    'eventStartTime',
    'eventEndTime'
  ]
  const incident = fakeIncident({
    id: 'id',
    code: 'eap-failure',
    apCount: 1,
    impactedApCount: 1,
    clientCount: 27,
    impactedClientCount: 5,
    path: [
      { type: 'zone', name: 'Edu2-611-Mesh' },
      { type: 'apGroup', name: '255_Edu2-611-group' },
      { type: 'ap', name: '70:CA:97:01:A0:C0' }
    ],
    startTime: '2022-07-19T05:15:00.000Z',
    endTime: '2022-07-20T02:42:00.000Z',
    sliceValue: 'RuckusAP'
  })
  const impactedAPs = [
    { name: 'name', mac: 'mac', model: 'model', version: 'version' }
  ] as ImpactedAP[]
  const impactedClients = [{
    mac: 'mac',
    manufacturer: 'manufacturer',
    ssid: 'ssid',
    hostname: 'hostname',
    username: 'username' }] as ImpactedClient[]
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'ImpactedAPs', { data: { incident: { impactedAPs } } })
    mockGraphqlQuery(dataApiURL, 'ImpactedClients', { data: { incident: { impactedClients } } })
  })
  it('should match snapshot', () => {
    const { asFragment } = render(<Provider>
      <IncidentAttributes incident={incident} visibleFields={attributeList} />
    </Provider>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should trigger onOpen/onClose of implactedClientsDrawer', async () => {
    render(<Provider>
      <IncidentAttributes incident={incident} visibleFields={attributeList} />
    </Provider>)
    const component = await screen.findByText('5 of 27 clients (18.52%)')
    fireEvent.click(component) // trigger onOpen
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should trigger onOpen/onClose of implactedAPsDrawer', async () => {
    render(<Provider>
      <IncidentAttributes incident={incident} visibleFields={attributeList} />
    </Provider>)
    const component = await screen.findByText('1 of 1 AP (100%)')
    fireEvent.click(component) // trigger onOpen
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
})
