
import { EPDG, QosPriorityEnum } from '@acx-ui/rc/utils'
import { Provider }              from '@acx-ui/store'
import { render, screen }        from '@acx-ui/test-utils'

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

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networksName,
  networkIds
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const setWifiCallingScope = jest.fn()

describe('WifiCallingScopeForm', () => {
  it('should render wifiCallingScopeForm successfully', async () => {
    const { asFragment } = render(<WifiCallingFormContext.Provider value={{
      state: initState,
      dispatch: setWifiCallingScope
    }}>
      <WifiCallingScopeForm edit={true}/>
    </WifiCallingFormContext.Provider>,
    {
      wrapper ,
      route: {
        params: { tenantId: 'tenantId1' }
      }
    })

    expect(screen.getByText('Network Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Venues')).toBeInTheDocument()
    expect(screen.getByText('Activate')).toBeInTheDocument()

    expect(asFragment()).toMatchSnapshot()
  })
})
