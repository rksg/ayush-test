import React from 'react'

import { act, within } from '@testing-library/react'
import { Form }        from 'antd'
import { rest }        from 'msw'

import { serviceApi }                                           from '@acx-ui/rc/services'
import { QosPriorityEnum, WifiCallingSetting, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen }                from '@acx-ui/test-utils'

import { WifiCallingSettingContext } from './ServicesForm'
import { WifiCallingSettingModal }   from './WifiCallingSettingModal'


const wifiCallingSettingTable = [
  {
    id: '1',
    serviceName: 'AT&T',
    description: 'AT&T des',
    qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE
  },
  {
    id: '2',
    serviceName: 'Sprint',
    description: 'Sprint des',
    qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE
  },
  {
    id: '3',
    serviceName: 'Verizon',
    description: 'Verizon des',
    qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE
  },
  {
    id: '4',
    serviceName: 'T-Mobile',
    description: 'T-Mobile des',
    qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE
  }
] as WifiCallingSetting[]

let wifiCallingSettingList = [] as WifiCallingSetting[]
const setWifiCallingSettingList = jest.fn()

describe('WifiCallingSettingModal', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
  })

  it('should only render wifiCallingSettingModal successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCallingList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingSettingTable)
      )
    ))

    render(
      <Provider>
        <Form>
          <WifiCallingSettingContext.Provider value={{
            wifiCallingSettingList,
            setWifiCallingSettingList
          }}>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'wifiCallingIds']}
              initialValue={wifiCallingSettingList}
            >
              <WifiCallingSettingModal />
            </Form.Item>
          </WifiCallingSettingContext.Provider>
        </Form>
      </Provider>, {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByText(/select profiles/i)).toBeTruthy()

    fireEvent.click(screen.getByText(/select profiles/i))

    await screen.findByText('AT&T')

    fireEvent.click(screen.getByText(/at&t/i))

    const addButton = screen.getByRole('button', {
      name: /add/i
    })

    expect(addButton).toBeTruthy()

    fireEvent.click(addButton)

    const dialog = screen.getByRole('dialog', {
      name: /select wi-fi calling profiles/i
    })

    within(dialog).getByRole('button', {
      name: /cancel/i
    })
    within(dialog).getByRole('button', {
      name: /save/i
    })

    fireEvent.click(screen.getByText(/at&t/i))

    const removeButton = screen.getByRole('button', {
      name: /remove/i
    })

    expect(removeButton).toBeTruthy()

    fireEvent.click(removeButton)

    fireEvent.click(screen.getByRole('button', {
      name: /cancel/i
    }))

  })

  it('should render wifiCallingSettingModal and saved successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCallingList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingSettingTable)
      )
    ))

    render(
      <Provider>
        <Form>
          <WifiCallingSettingContext.Provider value={{
            wifiCallingSettingList,
            setWifiCallingSettingList
          }}>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'wifiCallingIds']}
              initialValue={wifiCallingSettingList}
            >
              <WifiCallingSettingModal />
            </Form.Item>
          </WifiCallingSettingContext.Provider>
        </Form>
      </Provider>, {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByText(/select profiles/i)).toBeTruthy()

    fireEvent.click(screen.getByText(/select profiles/i))

    await screen.findByText('AT&T')

    fireEvent.click(screen.getByText(/at&t/i))

    const addButton = screen.getByRole('button', {
      name: /add/i
    })

    expect(addButton).toBeTruthy()

    fireEvent.click(addButton)

    const dialog = screen.getByRole('dialog', {
      name: /select wi-fi calling profiles/i
    })

    within(dialog).getByRole('button', {
      name: /cancel/i
    })
    within(dialog).getByRole('button', {
      name: /save/i
    })

    fireEvent.click(screen.getByText(/at&t/i))

    fireEvent.click(screen.getByRole('button', {
      name: /save/i
    }))

  })

  it('should only render wifiCallingSettingModal with initValue successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCallingList.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingSettingTable)
      )
    ))

    let wifiCallingSettingInitList = wifiCallingSettingTable as WifiCallingSetting[]

    render(
      <Provider>
        <Form>
          <WifiCallingSettingContext.Provider value={{
            wifiCallingSettingList: wifiCallingSettingInitList,
            setWifiCallingSettingList
          }}>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'wifiCallingIds']}
              initialValue={wifiCallingSettingInitList}
            >
              <WifiCallingSettingModal />
            </Form.Item>
          </WifiCallingSettingContext.Provider>
        </Form>
      </Provider>, {
        route: {
          params: { serviceId: 'wifiCallingServiceId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByText(/select profiles/i)).toBeTruthy()

    fireEvent.click(screen.getByText(/select profiles/i))

    await screen.findByText('AT&T')

    fireEvent.click(screen.getByRole('button', {
      name: /cancel/i
    }))

  })
})
