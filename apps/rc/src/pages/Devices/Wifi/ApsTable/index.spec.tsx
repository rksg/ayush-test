import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import ApsTable from '.'
import { useIsSplitOn } from '@acx-ui/feature-toggle'


describe('AP List Table', () => {
  const params = { tenantId: 'tenant-id' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        WifiUrlsInfo.addAp.url,
        (req, res, ctx) => res(ctx.json({
          txId: 'f83cdf6e-df01-466d-88ba-58e2f2c211c6'
        }))
      )
    )
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <ApsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi' }
      })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should show import CSV dialog', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true) // mock Features.DEVICES

    mockServer.use(
      rest.post(
        WifiUrlsInfo.addAp.url,
        (req, res, ctx) => res(ctx.json({
          txId: 'f83cdf6e-df01-466d-88ba-58e2f2c211c6'
        }))
      )
    )
    render(
      <Provider>
        <ApsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi' }
      })

    const csvFile = new File([''], 'aps_import_template.csv', { type: 'text/csv' })

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
