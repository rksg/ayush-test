import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation,
  DpskUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  mockedDpskPassphraseList,
  mockedTenantId,
  mockedServiceId,
  mockedDpskPassphrase,
  mockedDpskPassphraseListWithPersona
} from './__tests__/fixtures'
import DpskPassphraseManagement from './DpskPassphraseManagement'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn()
}))

describe('DpskPassphraseManagement', () => {
  const paramsForPassphraseTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphraseList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphraseList }))
      )
    )
  })

  it('should render the Passphrase Management view', async () => {
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.content[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    expect(targetRow).toBeInTheDocument()

    await userEvent.click(await within(targetRow).findByRole('img', { name: /eye-invisible/ }))
    const passwordElem = await within(targetRow).findByDisplayValue(targetRecord.passphrase)
    expect(passwordElem).toBeInTheDocument()

    // Verify Add Passphrases
    await userEvent.click(await screen.findByRole('button', { name: /Add Passphrases/ }))
    expect(await screen.findByRole('spinbutton', {
      name: /Number of Passphrases/
    })).toBeVisible()

    // Verify Add DPSK Network
    await userEvent.click(await screen.findByRole('button', { name: /Add DPSK Network/ }))
    const networkDialog = await screen.findByRole('dialog', { name: /Add DPSK Network/ })
    expect(networkDialog).toBeVisible()
    await userEvent.click(within(networkDialog).getAllByRole('button', { name: /Cancel/ })[0])
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Add DPSK Network/ })).toBeNull()
    })
  })

  it('should delete selected passphrase', async () => {
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.content[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/i }))

    const confirmMsgElem = await screen.findByText('Delete "' + targetRecord.username + '"?')
    expect(confirmMsgElem).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Passphrase/i }))
  })

  it('should not delete selected passphrase when it is mapped to Persona', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphraseList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphraseListWithPersona }))
      )
    )

    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseListWithPersona.content[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    expect(screen.queryByRole('button', { name: /Delete/ })).toBeNull()
  })

  it('should show error message when import CSV file failed', async () => {
    mockServer.use(
      rest.post(
        DpskUrls.uploadPassphrases.url,
        (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            message: 'An error occurred'
          }))
        }
      )
    )

    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Import From File/ }))

    const dialog = await screen.findByRole('dialog')

    const csvFile = new File([''], 'DPSK_import_template_expiration.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(dialog).findByRole('button', { name: /Import/ }))

    // TODO
    // expect(await screen.findByText('An error occurred')).toBeVisible()
  })

  it('should export the passphrases', async () => {
    const exportFn = jest.fn()

    mockServer.use(
      rest.get(
        DpskUrls.exportPassphrases.url,
        (req, res, ctx) => {

          const headers = req.headers['headers']

          // Get List API: 'Content-Type': 'application/json'
          if (headers['content-type'] === 'application/json') {
            return res(ctx.json({ ...mockedDpskPassphraseList }))
          }

          // Export to file API: 'Content-Type': 'text/csv'
          exportFn()

          return res(ctx.set({
            'content-disposition': 'attachment; filename=DPSK_export_20230118100829.csv',
            'content-type': 'text/csv;charset=ISO-8859-1'
          }), ctx.text('passphrase'))
        }
      )
    )

    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Export To File/ }))

    await waitFor(() => {
      expect(exportFn).toHaveBeenCalled()
    })
  })

  it('should edit selected passphrase', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphrase.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphrase }))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.content[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Edit Passphrase/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /Save/i })).toBeVisible()
  })
})
