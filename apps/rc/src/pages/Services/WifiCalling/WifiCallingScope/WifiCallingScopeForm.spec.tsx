
import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo, EPDG, QosPriorityEnum } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen }            from '@acx-ui/test-utils'

import { mockNetworkResult }  from '../__tests__/fixtures'
import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingScopeForm from './WifiCallingScopeForm'

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
  networksName,
  networkIds,
  epdgs
}

const setWifiCallingScope = jest.fn()

describe('WifiCallingScopeForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockNetworkResult))
      )
    )
  })

  it('should render wifiCallingScopeForm successfully', async () => {
    render(<WifiCallingFormContext.Provider value={{
      state: initState,
      dispatch: setWifiCallingScope
    }}>
      <Provider>
        <Form>
          <WifiCallingScopeForm edit={true}/>
        </Form>
      </Provider>
    </WifiCallingFormContext.Provider>,
    {
      route: {
        params: { tenantId: 'tenantId1' }
      }
    })

    expect(screen.getByText('Network Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Venues')).toBeInTheDocument()
    expect(screen.getByText('Activate')).toBeInTheDocument()

  })
})
