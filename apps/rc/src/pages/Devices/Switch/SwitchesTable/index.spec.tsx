import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import SwitchesTable from '.'

describe('Switch List Table', () => {
  const params = { tenantId: 'tenant-id' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        SwitchUrlsInfo.getMemberList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <SwitchesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/switch' }
      })
    const table = await screen.findByRole('table')
    expect(table).toBeVisible()
  })

  it('should show import CSV dialog', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.importSwitches.url,
        (req, res, ctx) => res(ctx.json({
          txId: 'f83cdf6e-df01-466d-88ba-58e2f2c211c6'
        }))
      )
    )
    render(
      <Provider>
        <SwitchesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/switch' }
      })

    const csvFile = new File(['(⌐□_□)'], 'aps_import_template.csv', { type: 'text/csv' })

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    await userEvent.click(await screen.findByText('Import from file'))

    const dialog = await screen.findByRole('dialog')

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)
    expect(dialog).toHaveTextContent('aps_import_template.csv')

    await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})
