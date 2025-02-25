
import { notificationApiURL, Provider }     from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import AuditLog from './AuditLog'

const mockAuditLogId = 'audit-log-id'
const mockDataConnectorName = 'data-connector-name'

describe('AuditLog', () => {
  it('should render audit log page correctly', async () => {
    mockRestApiQuery(
      `${notificationApiURL}/dataConnector/audit-log-id`,
      'get',
      {
        data: { name: mockDataConnectorName }
      }
    )
    // AuditLogTable
    mockRestApiQuery(
      `${notificationApiURL}/dataConnector/audit/query`,
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
    expect(await screen.findByText(`Audit Log (${mockDataConnectorName})`)).toBeVisible()
    // AuditLogTable
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })
})