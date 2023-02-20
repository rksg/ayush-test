import '@testing-library/jest-dom'

import { EPDG, QosPriorityEnum, WifiCallingFormContextType } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { render, screen }                                    from '@acx-ui/test-utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingSummaryForm from './WifiCallingSummaryForm'


const serviceName = 'serviceNameId1'
const description = 'description1'
const profileName = 'profileName1'
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = ['tag1', 'tag2', 'tag3']
const ePDG: EPDG[] = [{
  domain: 'init.aaa.com',
  ip: '10.10.10.10'
}]
const ePDGNoIp: EPDG[] = [{
  domain: 'init.aaa.com'
}]
const networkIds: string[] = ['nwId1', 'nwId2']
const networksName: string[] = ['nwName1', 'nwName2']
const epdgs: EPDG[] = [{
  domain: 'init.aaa.com',
  ip: '10.10.10.10'
}]
const epdgsNoIp: EPDG[] = [{
  domain: 'init.aaa.com'
}]

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
} as WifiCallingFormContextType

const initStateNoIp = {
  serviceName,
  profileName,
  ePDG: ePDGNoIp,
  qosPriority,
  tags,
  description,
  networkIds,
  networksName,
  epdgs: epdgsNoIp
} as WifiCallingFormContextType

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const setWifiCallingSummary = jest.fn()

describe('WifiCallingSummaryForm', () => {
  it('should render form successfully', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: setWifiCallingSummary
      }}>
        <WifiCallingSummaryForm />
      </WifiCallingFormContext.Provider>,
      { wrapper }
    )
    expect(screen.getByText('serviceNameId1')).toBeInTheDocument()
    expect(screen.getByText('description1')).toBeInTheDocument()
    expect(screen.getByText('Voice')).toBeInTheDocument()
    expect(screen.getByText('init.aaa.com (10.10.10.10)')).toBeInTheDocument()
  })

  it('should render form successfully without ip', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initStateNoIp,
        dispatch: setWifiCallingSummary
      }}>
        <WifiCallingSummaryForm />
      </WifiCallingFormContext.Provider>,
      { wrapper }
    )
    expect(screen.getByText('serviceNameId1')).toBeInTheDocument()
    expect(screen.getByText('description1')).toBeInTheDocument()
    expect(screen.getByText('Voice')).toBeInTheDocument()
    expect(screen.getByText('init.aaa.com')).toBeInTheDocument()
  })
})
