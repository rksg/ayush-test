import '@testing-library/jest-dom'

import { SyslogContextType } from '@acx-ui/rc/utils'
import { Provider }          from '@acx-ui/store'
import { render, screen }    from '@acx-ui/test-utils'

import SyslogContext from '../SyslogContext'

import SyslogSummaryForm from './SyslogSummaryForm'


const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const setSyslogSummary = jest.fn()

const initState = {
  policyName: 'policyName1',
  server: '1.1.1.1',
  port: '514',
  protocol: 'TCP',
  secondaryServer: '2.2.2.2',
  secondaryPort: '1514',
  secondaryProtocol: 'UDP',
  facility: 'KEEP_ORIGINAL',
  priority: 'ERROR',
  flowLevel: 'ALL',
  venues: [{
    id: 'venueId1',
    name: 'venueName1'
  }]
} as SyslogContextType

describe('SyslogSummaryForm', () => {
  it('should render form successfully', async () => {
    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogSummary
      }}>
        <SyslogSummaryForm />
      </SyslogContext.Provider>,
      { wrapper }
    )
    expect(screen.getByText('policyName1')).toBeInTheDocument()
  })
})
