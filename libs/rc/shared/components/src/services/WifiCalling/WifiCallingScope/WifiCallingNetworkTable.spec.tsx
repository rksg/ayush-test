import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { serviceApi }                            from '@acx-ui/rc/services'
import {
  CommonUrlsInfo, ConfigTemplateUrlsInfo,
  EPDG,
  QosPriorityEnum,
  WifiCallingFormContextType, WifiCallingUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { act ,mockServer, render, screen } from '@acx-ui/test-utils'

import { mockWifiCallingDetail, mockWifiCallingNetworksDetail } from '../__tests__/fixtures'
import WifiCallingFormContext                                   from '../WifiCallingFormContext'

import WifiCallingNetworkTable from './WifiCallingNetworkTable'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

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
const networkIds: string[] = ['1b34da3ca1784ab48ad97d609b02f61c']
const networksName: string[] = [mockWifiCallingNetworksDetail.data[0].name]
const epdgs: EPDG[] = [{
  domain: 'init.aaa.com',
  ip: '10.10.10.10'
}]
const oldNetworkIds: string[] = []

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networkIds,
  networksName,
  epdgs,
  oldNetworkIds
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

    mockServer.use(
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingNetworksDetail))),
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.post(ConfigTemplateUrlsInfo.getNetworkTemplateList.url,
        (req, res, ctx) => res(ctx.json(mockWifiCallingNetworksDetail)))
    )
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render wifiCallingNetworkTable and activate successfully', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: setWifiCallingNetwork
      }}>
        <Form>
          <WifiCallingNetworkTable edit={true}/>
        </Form>
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

    await screen.findByText(mockWifiCallingNetworksDetail.data[0].name)

    expect(screen.getAllByText('Passphrase (PSK/SAE)').length).toBe(2)
    let item = screen.getByRole('cell', {
      name: new RegExp(mockWifiCallingNetworksDetail.data[0].name, 'i')
    })
    await userEvent.click(item)
    await screen.findAllByText('Activate')

    let activateButton = screen.getAllByText('Activate')

    await userEvent.click(activateButton[0])

    await userEvent.click(item)
    let deactivateButton = screen.getAllByText('Deactivate')

    await userEvent.click(deactivateButton[0])

    await userEvent.click(screen.getAllByRole('switch')[0])

    await userEvent.click(screen.getAllByRole('switch')[1])
  })

  // eslint-disable-next-line max-len
  it('should render wifiCallingNetworkTable and activate successfully with configTemplate', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: setWifiCallingNetwork
      }}>
        <Form>
          <WifiCallingNetworkTable edit={true}/>
        </Form>
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

    await screen.findByText(mockWifiCallingNetworksDetail.data[0].name)

    expect(screen.getAllByText('Passphrase (PSK/SAE)').length).toBe(2)
  })
})
