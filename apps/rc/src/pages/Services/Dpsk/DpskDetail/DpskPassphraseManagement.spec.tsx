import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation,
  DpskUrls,
  CommonUrlsInfo
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
  mockedDpskPassphraseListWithPersona,
  mockedDpskPassphraseDevices
} from './__tests__/fixtures'
import DpskPassphraseManagement from './DpskPassphraseManagement'


jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn()
}))

describe.skip('DpskPassphraseManagement', () => {
  const paramsForPassphraseTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphraseList }))
      ),
      rest.delete(
        DpskUrls.deletePassphrase.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        DpskUrls.getDpskList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json({ data: {}, totalCount: 0 }))
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

    const targetRecord = mockedDpskPassphraseList.data[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    expect(targetRow).toBeInTheDocument()

    // Verify Add Passphrases
    await userEvent.click(await screen.findByRole('button', { name: /Add Passphrases/ }))
    expect(await screen.findByRole('spinbutton', { name: /Number of Passphrases/ })).toBeVisible()

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
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        DpskUrls.deletePassphrase.url,
        (req, res, ctx) => {
          deleteFn()
          return res(ctx.json({}))
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

    const targetRecord = mockedDpskPassphraseList.data[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/i }))

    const confirmMsgElem = await screen.findByText('Delete "' + targetRecord.username + '"?')
    expect(confirmMsgElem).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Passphrase/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should not delete selected passphrase when it is mapped to Persona', async () => {
    mockServer.use(
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
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

    const targetRecord = mockedDpskPassphraseListWithPersona.data[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in Persona')).toBeVisible()
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

    const importTextElement = await screen.findByText('Import from file')
    // eslint-disable-next-line testing-library/no-node-access
    const dialog = importTextElement.closest('.ant-drawer-content') as HTMLDivElement

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
        DpskUrls.exportPassphrases.url.split('?')[0],
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

  it('should render the edit passphrase view', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphrase.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphrase }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Edit Passphrase/i }))

    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.getByRole('textbox', { name: 'User Name' })).toHaveValue(mockedDpskPassphrase.username)
    })
  })

  it('should revoke/unrevoke the passphrases', async () => {
    const [ revokeFn, unrevokeFn ] = [ jest.fn(), jest.fn() ]

    mockServer.use(
      rest.patch(
        DpskUrls.revokePassphrases.url,
        (req, res, ctx) => {
          const body = req.body as { ids: string[], changes: { revocationReason: string | null } }

          if (body.changes.revocationReason) {
            revokeFn(body)
          } else {
            unrevokeFn(body)
          }

          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Revoke' }))

    const revokeTextElement = await screen.findByText('Revoke "' + targetRecord.username + '"?')
    // eslint-disable-next-line testing-library/no-node-access
    const dialog = revokeTextElement.closest('.ant-modal-confirm') as HTMLDivElement

    // const dialog = await screen.findByRole('dialog')
    // expect(await within(dialog).findByText('Revoke "' + targetRecord.username + '"?')).toBeVisible()


    await userEvent.type(
      within(dialog).getByRole('textbox', { name: /Type the reason to revoke/i }),
      '1234'
    )

    await userEvent.click(within(dialog).getByRole('button', { name: /OK/i }))
    await waitFor(() => {
      expect(revokeFn).toHaveBeenCalledWith({
        ids: [targetRecord.id],
        changes: { revocationReason: '1234' }
      })
    })

    await userEvent.click(await within(targetRow).findByRole('checkbox', { checked: false }))
    await userEvent.click(await screen.findByRole('button', { name: 'Unrevoke' }))
    await waitFor(() => {
      expect(unrevokeFn).toHaveBeenCalledWith({
        ids: [targetRecord.id],
        changes: { revocationReason: null }
      })
    })
  })

  it('should be able to add device in DpskPassphrase', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedDpskPassphraseDevices))
      ),
      rest.patch(
        DpskUrls.updatePassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'req1' }))
      ),
      rest.delete(
        DpskUrls.deletePassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'req2' }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Manage Devices' }))

    await screen.findByText(/ad:2c:3b:1d:4d:4e/i)

    await userEvent.click(await screen.findByRole('button', {
      name: /add device/i
    }))

    await screen.findByRole('dialog', {
      name: /add device/i
    })

    await userEvent.type(
      screen.getByRole('textbox', {
        name: /mac address/i
      }), 'DC:AE:EB:22:5E:60'
    )

    await userEvent.click(screen.getByText(/add another device/i))

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add' })
    )

    await userEvent.click(screen.getAllByText(/cancel/i)[1])

    await userEvent.click(screen.getAllByText(/cancel/i)[0])
  })

  it('should be able to delete device in DpskPassphrase', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedDpskPassphraseDevices))
      ),
      rest.patch(
        DpskUrls.updatePassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'req1' }))
      ),
      rest.delete(
        DpskUrls.deletePassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'req2' }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Manage Devices' }))

    const dialogTextElement = await screen.findByText('Manage Passphrase Devices')
    // eslint-disable-next-line testing-library/no-node-access
    const dialog = dialogTextElement.closest('.ant-drawer-content') as HTMLDivElement

    const targetDevice = await within(dialog).findByRole('row', { name: /ad:2c:3b:1d:4d:4e/i })

    await userEvent.click(within(targetDevice).getByRole('checkbox'))
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(within(dialog).queryByRole('button', { name: 'Delete' })).toBeNull()
    })
  })
})
