import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { serviceApi }                             from '@acx-ui/rc/services'
import { WifiCallingSetting, WifiCallingUrls }    from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
import { act, mockServer, render, screen,within } from '@acx-ui/test-utils'


import { mockWifiCallingTableResult } from '../../services/WifiCalling/__tests__/fixtures'

import { WifiCallingSettingContext } from './NetworkControlTab'
import { WifiCallingSettingModal }   from './WifiCallingSettingModal'


let wifiCallingSettingList = [] as WifiCallingSetting[]
const setWifiCallingSettingList = jest.fn()

describe('WifiCallingSettingModal', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCallingList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingTableResult))),
      rest.post(WifiCallingUrls.getEnhancedWifiCallingList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingTableResult)))
    )
  })

  it('should only render wifiCallingSettingModal successfully', async () => {
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

    await userEvent.click(screen.getByText(/select profiles/i))

    await screen.findByText(mockWifiCallingTableResult.data[0].name)

    const item = screen.getByText(mockWifiCallingTableResult.data[0].name)

    await userEvent.click(item)

    const addButton = screen.getByRole('button', {
      name: /add/i
    })

    expect(addButton).toBeTruthy()

    await userEvent.click(addButton)

    const dialog = screen.getByRole('dialog', {
      name: /select wi-fi calling profiles/i
    })

    within(dialog).getByRole('button', {
      name: /cancel/i
    })
    within(dialog).getByRole('button', {
      name: /save/i
    })

    await userEvent.click(item)

    const removeButton = screen.getByRole('button', {
      name: /remove/i
    })

    expect(removeButton).toBeTruthy()

    await userEvent.click(removeButton)

    await userEvent.click(screen.getByRole('button', {
      name: /cancel/i
    }))

  })

  it('should render wifiCallingSettingModal and saved successfully', async () => {
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

    await userEvent.click(screen.getByText(/select profiles/i))

    await screen.findByText(mockWifiCallingTableResult.data[0].name)

    const item = screen.getByText(mockWifiCallingTableResult.data[0].name)

    await userEvent.click(item)

    const addButton = screen.getByRole('button', {
      name: /add/i
    })

    expect(addButton).toBeTruthy()

    await userEvent.click(addButton)

    const dialog = screen.getByRole('dialog', {
      name: /select wi-fi calling profiles/i
    })

    within(dialog).getByRole('button', {
      name: /cancel/i
    })
    within(dialog).getByRole('button', {
      name: /save/i
    })

    await userEvent.click(item)

    await userEvent.click(screen.getByRole('button', {
      name: /save/i
    }))

  })

  it('should only render wifiCallingSettingModal with initValue successfully', async () => {
    render(
      <Provider>
        <Form>
          <WifiCallingSettingContext.Provider value={{
            wifiCallingSettingList: [] as WifiCallingSetting[],
            setWifiCallingSettingList
          }}>
            <Form.Item
              name={['wlan', 'advancedCustomization', 'wifiCallingIds']}
              initialValue={[]}
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

    await userEvent.click(screen.getByText(/select profiles/i))

    await userEvent.click(screen.getByRole('button', {
      name: /cancel/i
    }))

  })
})
