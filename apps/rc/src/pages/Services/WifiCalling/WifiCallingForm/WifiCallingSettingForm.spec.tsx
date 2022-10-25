import { act, fireEvent } from '@testing-library/react'
import { rest }           from 'msw'

import { serviceApi }                             from '@acx-ui/rc/services'
import { EPDG, QosPriorityEnum, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
import { mockServer, render, screen }             from '@acx-ui/test-utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingSettingForm from './WifiCallingSettingForm'



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

const serviceName = ''
const description = ''
const profileName = ''
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = []
const ePDG: EPDG[] = []
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
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const setWifiCallingSetting = jest.fn()


describe('WifiCallingSettingForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(serviceApi.util.resetApiState())
    })
  })

  it('should render WifiCallingSettingForm successfully', async () => {
    mockServer.use(rest.get(
      WifiCallingUrls.getWifiCalling.url,
      (_, res, ctx) => res(
        ctx.json(wifiCallingResponse)
      )
    ))
    const { asFragment } = render(
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
    let serviceName = screen.getByRole('textbox', { name: /service name/i })
    expect(serviceName).toBeEmptyDOMElement()
    let tags = screen.getByRole('textbox', { name: /tags/i })
    expect(tags).toBeEmptyDOMElement()
    let desc = screen.getByRole('textbox', { name: /description/i })
    expect(desc).toBeEmptyDOMElement()

    fireEvent.change(serviceName,
      { target: { value: 'serviceName1' } })
    expect(serviceName).toHaveValue('serviceName1')

    fireEvent.change(tags,
      { target: { value: 'tag1,tag2,tag3' } })
    expect(tags).toHaveValue('tag1,tag2,tag3')

    fireEvent.change(desc,
      { target: { value: 'desc1' } })
    expect(desc).toHaveValue('desc1')

    expect(screen.getByTestId('selectQosPriorityId')).toBeTruthy()
    fireEvent.click(screen.getByTestId('selectQosPriorityId'))

    const WIFICALLING_PRI_BE = 'WIFICALLING_PRI_BE'

    fireEvent.select(screen.getByTestId('selectQosPriorityId'), {
      target: { WIFICALLING_PRI_BE }
    })

    expect(asFragment()).toMatchSnapshot()
  })
})
