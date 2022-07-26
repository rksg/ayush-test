import moment from 'moment'

import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { incidentInformation }                         from '@acx-ui/analytics/utils'
import { Provider, store }                             from '@acx-ui/store'
import { fireEvent, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { IncidentAttributesProps, IncidentDetailsProps } from '../types'

import { ImpactedAP, impactedAPsApi, ImpactedClient, impactedClientsApi } from './services'

import {
  durationOf,
  formattedNodeName,
  formattedSliceType,
  formattedPath,
  getImpactedArea,
  getImpactValues,
  IncidentAttributes
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

describe('formattedNodeName', () => {
  it('should return correct value', () => {
    expect(formattedNodeName({ type: 'ap', name: '70:CA:97:01:A0:C0' }, 'RuckusAP'))
      .toBe('RuckusAP (70:CA:97:01:A0:C0)')
    expect(formattedNodeName({ type: 'ap', name: 'RuckusAP' }, 'RuckusAP'))
      .toBe('RuckusAP')
    expect(formattedNodeName({ type: 'apGroup', name: 'default' }, 'default'))
      .toBe('default')
  })
})

describe('formattedSliceType', () => {
  it('should return correct value', () => {
    expect(formattedSliceType('network')).toEqual('Network')
    expect(formattedSliceType('apGroupName')).toEqual('AP Group')
    expect(formattedSliceType('apGroup')).toEqual('AP Group')
    expect(formattedSliceType('zoneName')).toEqual('Venue')
    expect(formattedSliceType('zone')).toEqual('Venue')
    expect(formattedSliceType('switchGroup')).toEqual('Venue')
    expect(formattedSliceType('switch')).toEqual('Switch')
    expect(formattedSliceType('apMac')).toEqual('Access Point')
    expect(formattedSliceType('ap')).toEqual('Access Point')
    expect(formattedSliceType('AP')).toEqual('Access Point')
    expect(formattedSliceType('other')).toEqual('other')
  })
})

describe('formattedPath', () => {
  it('returns path with correct format', () => {
    const path = [
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' }
    ]
    expect(formattedPath(path, 'Name'))
      .toEqual('N (Network)\n> V (Venue)\n> AG (AP Group)')
  })
  it('returns path which contains AP with correct format', () => {
    const path = [
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' },
      { type: 'ap', name: 'IP' }
    ]
    expect(formattedPath(path, 'Name')).toEqual(
      'N (Network)\n> V (Venue)\n> AG (AP Group)\n> Name (IP) (Access Point)'
    )
  })
})

describe('getImpactedArea', () => {
  const path = [{ type: 'zone', name: 'Venue' }]
  it('return correct value for normal incident', () => {
    const sliceValue = 'Venue'
    expect(getImpactedArea(path, sliceValue)).toEqual(sliceValue)
  })
  it('return correct value for AP incident', () => {
    const apPath = [...path, { type: 'ap', name: 'IP' }]
    const sliceValue = 'AP'
    expect(getImpactedArea(apPath, sliceValue)).toEqual(`${sliceValue} (IP)`)
  })
  it('returns sliceValue when node name same as sliceValue', () => {
    const sameNamePath = [...path, { type: 'ap', name: 'AP' }]
    const sliceValue = 'AP'
    expect(getImpactedArea(sameNamePath, sliceValue)).toEqual(sliceValue)
  })
  it('returns sliceValue when empty path', () => {
    const emptyPath = [] as IncidentAttributesProps['path']
    const sliceValue = 'AP'
    expect(getImpactedArea(emptyPath, sliceValue)).toEqual(sliceValue)
  })
})

describe('getImpactValues', () => {
  it('handles when incident has no client impact', () => {
    expect(getImpactValues('client', -1, -1)).toMatchSnapshot()
  })

  it('handles when incident is calculating', () => {
    expect(getImpactValues('client', null, null)).toMatchSnapshot()
  })

  it('handles clientCount = 0', () => {
    expect(getImpactValues('client', 0, 0)).toMatchSnapshot()
  })

  it('handles when incident has no client impact but has clinet count', () => {
    expect(getImpactValues('client', 128, 0)).toMatchSnapshot()
  })

  it('handles when incident has client impact', () => {
    expect(getImpactValues('client', 128, 55)).toMatchSnapshot()
  })

  it('formats impacted client count', () => {
    expect(getImpactValues('client', 1500, 1300)).toMatchSnapshot()
  })

  it('formats impacted ap count', () => {
    expect(getImpactValues('ap', 1, 1)).toMatchSnapshot()
  })
})

describe('IncidentAttributes', () => {
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
  const props = {
    id: 'id',
    code: 'code',
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
    sliceType: 'ap',
    sliceValue: 'RuckusAP'
  } as IncidentDetailsProps
  const info = incidentInformation[props.code as keyof typeof incidentInformation]
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
    store.dispatch(impactedAPsApi.util.resetApiState())
    store.dispatch(impactedClientsApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'ImpactedAPs', { data: { incident: { impactedAPs } } })
    mockGraphqlQuery(dataApiURL, 'ImpactedClients', { data: { incident: { impactedClients } } })
  })
  it('should match snapshot', () => {
    const { asFragment } = render(<Provider>
      <IncidentAttributes {...props} {...info} visibleFields={attributeList}/>
    </Provider>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should trigger onOpen/onClose of implactedClientsDrawer', async () => {
    render(<Provider>
      <IncidentAttributes {...props} {...info} visibleFields={attributeList}/>
    </Provider>)
    const component = await screen.findByText('5 of 27 clients (18.52%)')
    fireEvent.click(component) // trigger onOpen
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should trigger onOpen/onClose of implactedAPsDrawer', async () => {
    render(<Provider>
      <IncidentAttributes {...props} {...info} visibleFields={attributeList}/>
    </Provider>)
    const component = await screen.findByText('1 of 1 AP (100%)')
    fireEvent.click(component) // trigger onOpen
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
})
