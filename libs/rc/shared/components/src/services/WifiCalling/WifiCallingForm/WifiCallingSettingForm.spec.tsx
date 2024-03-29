import React from 'react'

import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { Form }    from 'antd'
import { rest }    from 'msw'

import { serviceApi }                             from '@acx-ui/rc/services'
import { EPDG, QosPriorityEnum, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
import { act, mockServer, render, screen }        from '@acx-ui/test-utils'

import { mockWifiCallingTableResult, wifiCallingSettingTable } from '../__tests__/fixtures'
import WifiCallingFormContext                                  from '../WifiCallingFormContext'

import WifiCallingSettingForm from './WifiCallingSettingForm'

const serviceName = ''
const description = ''
const profileName = ''
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = []
const ePDG: EPDG[] = []
const networkIds: string[] = []
const networksName: string[] = []
const epdgs: EPDG[] = []

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networkIds,
  networksName,
  epdgs
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}
const setWifiCallingSetting = jest.fn()
const mockedEnhancedWifiCallingList = jest.fn()

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('WifiCallingSettingForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        WifiCallingUrls.getWifiCallingList.url,
        (_, res, ctx) => res(ctx.json(wifiCallingSettingTable))),
      rest.post(WifiCallingUrls.getEnhancedWifiCallingList.url,
        (req, res, ctx) => {
          mockedEnhancedWifiCallingList()
          return res(ctx.json(mockWifiCallingTableResult))
        })
    )
  })

  it('should render WifiCallingSettingForm successfully', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: setWifiCallingSetting
      }}>
        <WifiCallingSettingForm />
      </WifiCallingFormContext.Provider>,
      {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )
    await waitFor(() => expect(mockedEnhancedWifiCallingList).toHaveBeenCalled())

    let serviceName = screen.getByRole('textbox', { name: /service name/i })
    expect(serviceName).toBeEmptyDOMElement()
    let desc = screen.getByRole('textbox', { name: /description/i })
    expect(desc).toBeEmptyDOMElement()

    await userEvent.type(serviceName, 'serviceTest')
    expect(serviceName).toHaveValue('serviceTest')

    await userEvent.type(desc, 'desc')
    expect(desc).toHaveValue('desc')

    expect(screen.getByTestId('selectQosPriorityId')).toBeTruthy()
    const combobox = await screen.findByRole('combobox', { name: /qos priority/i })
    await userEvent.click(combobox)

    await userEvent.selectOptions(combobox, 'Voice')

    expect(screen.getByText('Voice')).toBeVisible()
  })
})
