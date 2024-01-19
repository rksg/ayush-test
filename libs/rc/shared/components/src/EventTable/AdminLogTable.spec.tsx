import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { AdminLog, TableQuery } from '@acx-ui/rc/utils'
import { Provider }             from '@acx-ui/store'
import { render, screen }       from '@acx-ui/test-utils'
import { RequestPayload }       from '@acx-ui/types'

import { adminLogs, adminLogsMeta } from './__tests__/fixtures'

import { AdminLogTable } from '.'

const params = { tenantId: 'tenant-id' }

const mockExportCsv = jest.fn()
jest.mock('./useExportCsv', () => ({
  ...jest.requireActual('./useExportCsv'),
  useExportCsv: () => ({ exportCsv: mockExportCsv })
}))

describe('AdminLogTable', () => {
  const tableQuery = {
    data: { data: adminLogs.map(base =>
      ({ ...base, ...adminLogsMeta.find(meta => meta.id === base.id) }))
    },
    pagination: { current: 1, page: 1, pageSize: 10, total: 0 },
    handleTableChange: jest.fn()
  } as unknown as TableQuery<AdminLog, RequestPayload<unknown>, unknown>

  it('should render admin log list', async () => {
    render(<AdminLogTable tableQuery={tableQuery} />, { route: { params }, wrapper: Provider })
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.', {
        ignore: true
      }
    )
  })

  it('should open/close admin log drawer', async () => {
    render(<AdminLogTable tableQuery={tableQuery} />, { route: { params }, wrapper: Provider }
    )
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.'
    )
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    expect(screen.getByRole('dialog')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })

  it('should close drawer, when data changed', async () => {
    const { rerender } = render(
      <Provider>
        <AdminLogTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.'
    )
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    screen.getByText('Log Details')

    const newTableQuery = {
      ...tableQuery, data: { data: [] }
    } as unknown as TableQuery<AdminLog, RequestPayload<unknown>, unknown>
    rerender(<Provider><AdminLogTable tableQuery={newTableQuery} /></Provider>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })

  it('should download csv on click', async () => {
    render(
      <AdminLogTable tableQuery={tableQuery} />,
      { route: { params }, wrapper: Provider }
    )
    await userEvent.click(screen.getByTestId('DownloadOutlined'))
    expect(mockExportCsv).toBeCalled()
  })
})
