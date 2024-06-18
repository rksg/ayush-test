import '@testing-library/jest-dom'
import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EPDG, QosPriorityEnum, ServicesConfigTemplateUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  renderHook,
  waitFor
}    from '@acx-ui/test-utils'

import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'

import EpdgTable from './EpdgTable'

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

const initState_withoutEpdg = {
  ...initState,
  ePDG: [],
  epdgs: []
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

const wifiCallingResponse = {
  networkIds: [
    '62b18f6cd1ae455cbbf1e2c547d8d422'
  ],
  description: '--',
  qosPriority: 'WIFICALLING_PRI_VOICE',
  serviceName: 'service-name-test2',
  id: 'bb21e5fad7ca4b639ee9a9cd157bc5fc',
  epdgs: [{
    domain: 'a.b.com',
    ip: '1.1.1.1'
  }]
}

const wifiCallingServiceResponse = {
  id: 'serviceId1',
  profileName: 'att',
  description: '',
  qosPriority: 'WIFICALLING_PRI_VOICE', //Allowed values are "WIFICALLING_PRI_VOICE", "WIFICALLING_PRI_VIDEO", "WIFICALLING_PRI_BE", "WIFICALLING_PRI_BG"
  ePDGs: [],
  networkIds: [
    'networkId1',
    'networkId2',
    'networkId3'
  ],
  tags: [
    'tag1',
    'tag2'
  ],
  epdgs: []
}

describe('EpdgTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(wifiCallingResponse))),
      rest.put(WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))),
      rest.get(ServicesConfigTemplateUrlsInfo.getWifiCalling.url,
        (_, res, ctx) => res(ctx.json(wifiCallingResponse))),
      rest.put(ServicesConfigTemplateUrlsInfo.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse)))
    )
  })
  it('should render drawer successfully after clicking the Add button', async () => {
    const { result } = renderHook(() => useReducer(mainReducer, initState_withoutEpdg))
    const [state, dispatch] = result.current

    render(<WifiCallingFormContext.Provider value={{
      state: state,
      dispatch: dispatch
    }}>
      <EpdgTable edit={true}/>
    </WifiCallingFormContext.Provider>, {
      wrapper: wrapper,
      route: {
        params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
      }
    })

    const addButton = screen.getByRole('button', { name: 'Add' })
    await userEvent.click(addButton)
    expect(screen.getByText('Add ePDG')).toBeInTheDocument()

    const domainInput = screen.getByPlaceholderText('Please enter the domain name')
    const ipInput = screen.getByPlaceholderText('Please enter the ip address')
    await userEvent.type(domainInput, 'aaa.bbb.com')
    await userEvent.type(ipInput, '10.10.10.10')
    expect(domainInput).toHaveValue('aaa.bbb.com')
    expect(ipInput).toHaveValue('10.10.10.10')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeInTheDocument()
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument()
    })
  })

  it('should render drawer successfully after clicking the Edit button', async () => {
    const { result } = renderHook(() => useReducer(mainReducer, initState))
    const [state, dispatch] = result.current

    render(<WifiCallingFormContext.Provider value={{
      state: state,
      dispatch: dispatch
    }}>
      <EpdgTable edit={true}/>
    </WifiCallingFormContext.Provider>, {
      wrapper: wrapper,
      route: {
        params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
      }
    })
    const ePDG = screen.getByText('init.aaa.com')
    await userEvent.click(ePDG)
    const editButton = screen.getByText('Edit')

    expect(editButton).toBeInTheDocument()
    await userEvent.click(editButton)

    expect(screen.getByText('Edit ePDG')).toBeInTheDocument()
  })

  it('should render drawer successfully after clicking the Delete button', async () => {
    const { result } = renderHook(() => useReducer(mainReducer, initState))
    const [state, dispatch] = result.current

    render(<WifiCallingFormContext.Provider value={{
      state: state,
      dispatch: dispatch
    }}>
      <EpdgTable edit={true}/>
    </WifiCallingFormContext.Provider>, {
      wrapper: wrapper,
      route: {
        params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
      }
    })
    const ePDG = screen.getByText('init.aaa.com')
    await userEvent.click(ePDG)
    const deleteButton = screen.getByText('Delete')

    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(deleteButton)

    await screen.findByText(/delete rule/i)

    await userEvent.click(screen.getByRole('button', {
      name: /delete rule/i
    }))
    expect(screen.queryByText('Delete rule')).not.toBeInTheDocument()
  })
})
