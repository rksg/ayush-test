import React from 'react'

import { act, fireEvent } from '@testing-library/react'
import { rest }           from 'msw'

import { serviceApi }                           from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EPDG,
  QosPriorityEnum,
  WifiCallingFormContextType, WifiCallingUrls
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingNetworkTable from './WifiCallingNetworkTable'


const wifiCallingResponse = {
  networkIds: [
    '62b18f6cd1ae455cbbf1e2c547d8d422'
  ],
  description: '--',
  qosPriority: 'WIFICALLING_PRI_VOICE',
  serviceName: 'service-name-test2',
  id: 'bb21e5fad7ca4b639ee9a9cd157bc5fc',
  epdgs: [
    {
      ip: '1.1.1.1',
      domain: 'a.b.c.com'
    }
  ]
}

const wifiCallingNetworkTable = {
  fields: [
    'name',
    'venues',
    'id',
    'nwSubType'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'birdytest2',
      id: '1b34da3ca1784ab48ad97d609b02f61c',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'birdyVenue'
        ]
      }
    },
    {
      name: 'birdywlan-dev',
      id: '62b18f6cd1ae455cbbf1e2c547d8d422',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'birdyVenue'
        ]
      }
    }
  ]
}

let wifiCallingNetworkList = wifiCallingNetworkTable
const setWifiCallingNetwork = jest.fn()

const serviceName = 'serviceNameId1'
const description = 'description1'
const profileName = 'profileName1'
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = ['tag1', 'tag2', 'tag3']
const ePDG: EPDG[] = [{
  domain: 'init.aaa.com',
  ip: '10.10.10.10'
}]
const networkIds: string[] = []
const networksName: string[] = []

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networkIds,
  networksName
} as WifiCallingFormContextType

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('WifiCallingNetworkTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
  })

  it('should render wifiCallingNetworkTable and activate successfully', async () => {
    mockServer.use(rest.post(
      CommonUrlsInfo.getVMNetworksList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingNetworkList)
      )
    ), rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingResponse)
      )
    ))

    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: setWifiCallingNetwork
      }}>
        <WifiCallingNetworkTable edit={true}/>
      </WifiCallingFormContext.Provider>,
      {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )

    expect(screen.getByText('Network Name')).toBeTruthy()
    expect(screen.getByText('Type')).toBeTruthy()
    expect(screen.getByText('Venues')).toBeTruthy()
    expect(screen.getByText('Activate')).toBeTruthy()

    await screen.findByText('birdytest2')

    expect(screen.getAllByText('psk').length).toBe(2)
    let item = screen.getByRole('cell', {
      name: /birdytest2/i
    })
    fireEvent.click(item)
    await screen.findAllByText('Activate')

    let activateButton = screen.getAllByText('Activate')

    fireEvent.click(activateButton[0])

    await screen.findByText('Activate 1 network(s)')


    fireEvent.click(item)
    let deactivateButton = screen.getAllByText('Deactivate')

    fireEvent.click(deactivateButton[0])

    await screen.findByText('Deactivate 1 network(s)')

  }, 20000)
})
