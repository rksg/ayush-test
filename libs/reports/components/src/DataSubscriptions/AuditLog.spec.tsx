
import { notificationApiURL, Provider }     from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import AuditLog from './AuditLog'

const mockAuditLogId = 'audit-log-id'
const mockDataSubscriptionName = 'data-subscription-name'

describe('AuditLog', () => {
  it('should render audit log page correctly', async () => {
    mockRestApiQuery(
      `${notificationApiURL}/dataSubscriptions/audit-log-id`,
      'get',
      {
        data: { name: mockDataSubscriptionName }
      }
    )
    // AuditLogTable
    mockRestApiQuery(
      `${notificationApiURL}/dataSubscriptions/audit/query`,
      'post',
      {
        data: [],
        page: 1,
        totalCount: 0
      }
    )

    render(<AuditLog />, {
      route: { params: { settingId: mockAuditLogId } },
      wrapper: Provider
    })
    expect(await screen.findByText(`Audit Log (${mockDataSubscriptionName})`)).toBeVisible()
    // AuditLogTable
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })
})