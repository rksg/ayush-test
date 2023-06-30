import { ACLDirection, EdgeFirewallACLStatsViewData } from '@acx-ui/rc/utils'
import { Provider }                                   from '@acx-ui/store'
import {
  render,
  screen } from '@acx-ui/test-utils'

import { ACLOtherInfoTable } from './ACLOtherInfoTable'


const mockedACLStats = {
  direction: ACLDirection.INBOUND,
  permittedSessions: 160,
  aclRuleStatsList: [
    {
      priority: 1,
      packets: 12,
      bytes: 72
    },
    {
      priority: 2,
      packets: 9,
      bytes: 10
    }
  ]
}

describe('Edge firewall service other stats data table', () => {
  it('should correctly render', async () => {
    render(
      <Provider>
        <ACLOtherInfoTable
          stats={mockedACLStats as EdgeFirewallACLStatsViewData}
        />
      </Provider>)


    expect(screen.queryByRole('row', { name: /Permmited by ACL Sessions 160/ })).toBeValid()
  })

  it('should correctly render when data is NaN', async () => {
    const mockedNaNPermittedData = {
      ...mockedACLStats,
      permittedSessions: 'NaN'
    }

    render(
      <Provider>
        <ACLOtherInfoTable
          stats={mockedNaNPermittedData}
        />
      </Provider>)

    expect(screen.queryByRole('row', { name: 'Permmited by ACL Sessions --' })).toBeValid()
  })
})