import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { serviceApi }                               from '@acx-ui/rc/services'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation,
  DpskUrls,
  CommonUrlsInfo,
  convertDpskNewFlowUrl
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
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
  mockedDpskPassphraseDevices
} from './__tests__/fixtures'
import DpskPassphraseManagement from './DpskPassphraseManagement'

const mockedDownloadCsv = jest.fn()
const mockedDownloadNewFlowCsv = jest.fn()

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn()
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useDownloadPassphrasesMutation: () => ([ mockedDownloadCsv ]),
  useLazyDownloadNewFlowPassphrasesQuery: () => ([ mockedDownloadNewFlowCsv ])
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
    store.dispatch(serviceApi.util.resetApiState())

    mockServer.use(
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphraseList }))
      ),
      rest.post(
        convertDpskNewFlowUrl(DpskUrls.getEnhancedPassphraseList.url),
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
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
      ),
      rest.get(
        DpskUrls.getPassphrase.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphrase }))
      ),
      rest.get(
        DpskUrls.getPassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedDpskPassphraseDevices))
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

    const targetUsername = new RegExp(mockedDpskPassphraseList.data[0].username)
    expect(await screen.findByRole('row', { name: targetUsername })).toBeVisible()

    // Verify Add Passphrases
    await userEvent.click(await screen.findByRole('button', { name: /Add Passphrases/ }))
    expect(await screen.findByRole('spinbutton', { name: /Number of Passphrases/ })).toBeVisible()

    const confirmDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(confirmDialog).findByText('Cancel'))
    await waitFor(() => expect(confirmDialog).not.toBeInTheDocument())
  })

  it('should delete selected passphrase', async () => {
    mockServer.use(
      rest.delete(
        DpskUrls.deletePassphrase.url,
        (req, res, ctx) => res(ctx.json({}))
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

    const confirmDialog = await screen.findByRole('dialog')
    expect(within(confirmDialog).getByText(`Delete "${targetRecord.username}"?`)).toBeVisible()

    await userEvent.click(within(confirmDialog).getByRole('button', { name: /Delete Passphrase/i }))

    await waitFor(() => expect(confirmDialog).not.toBeInTheDocument())
  })

  it('should not delete selected passphrase when it is mapped to Identity', async () => {
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[3]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    const confirmDialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    expect(within(confirmDialog).getByText('You are unable to delete this record due to its usage in Identity')).toBeVisible()

    await userEvent.click(await screen.findByText('OK'))
    await waitFor(() => expect(confirmDialog).not.toBeInTheDocument())
  })

  it('should show error message when import CSV file failed', async () => {
    mockServer.use(
      rest.post(
        DpskUrls.uploadPassphrases.url,
        (req, res, ctx) => {
          return res(ctx.status(406), ctx.json({
            error: 'Not Acceptable',
            message: 'An error occurred',
            path: '',
            status: 406,
            timestamp: '2023-07-28T15:40:54.500+0000',
            trace: ''
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
    const importDialog = importTextElement.closest('.ant-drawer-content') as HTMLDivElement

    const csvFile = new File([''], 'DPSK_import_template_expiration.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(importDialog).findByRole('button', { name: /Import/ }))

    // TODO
    // expect(await screen.findByText('An error occurred')).toBeVisible()
  })

  it('should export the passphrases', async () => {
    mockedDownloadCsv.mockImplementation(() => ({
      unwrap: () => Promise.resolve()
    }))
    mockedDownloadNewFlowCsv.mockImplementation(() => ({
      unwrap: () => Promise.resolve()
    }))

    const { rerender } = render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Export To File/ }))

    await waitFor(() => expect(mockedDownloadCsv).toHaveBeenCalledTimes(1))

    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)
    rerender(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>
    )
    await userEvent.click(await screen.findByRole('button', { name: /Export To File/ }))
    await waitFor(() => expect(mockedDownloadNewFlowCsv).toHaveBeenCalledTimes(1))

    jest.mocked(useIsSplitOn).mockReset()
  })

  it('should render the edit passphrase view', async () => {
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

    const revocableRecord = mockedDpskPassphraseList.data[0]
    // eslint-disable-next-line max-len
    const revocableRow = await screen.findByRole('row', { name: new RegExp(revocableRecord.username) })

    await userEvent.click(within(revocableRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Revoke' }))

    const revokeDialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    const revokeInput = within(revokeDialog).getByRole('textbox', { name: /Type the reason to revoke/i })

    // Character limit validation
    await userEvent.type(revokeInput, 'a'.repeat(256))
    // eslint-disable-next-line max-len
    expect((await within(revokeDialog).findByRole('alert')).textContent).toBe('Field exceeds 255 characters')
    await userEvent.clear(revokeInput)

    await userEvent.type(revokeInput, '1234')
    await userEvent.click(within(revokeDialog).getByRole('button', { name: /OK/i }))
    await waitFor(() => {
      expect(revokeFn).toHaveBeenCalledWith({
        ids: [revocableRecord.id],
        changes: { revocationReason: '1234' }
      })
    })

    await waitFor(() => {
      expect(revokeDialog).not.toBeVisible()
    })

    await userEvent.click(await within(revocableRow).findByRole('checkbox', { checked: false }))
    await userEvent.click(await screen.findByRole('button', { name: 'Unrevoke' }))
    await waitFor(() => {
      expect(unrevokeFn).toHaveBeenCalledWith({
        ids: [revocableRecord.id],
        changes: { revocationReason: null }
      })
    })
  })

  it('should not revoke/unrevoke the passphrases when it is mapped to Identity', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const unrevocableRecord = mockedDpskPassphraseList.data[3]
    // eslint-disable-next-line max-len
    const unrevocableRow = await screen.findByRole('row', { name: new RegExp(unrevocableRecord.username) })
    await userEvent.click(within(unrevocableRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Revoke' }))

    const warningDialog = await screen.findByRole('dialog')

    // eslint-disable-next-line max-len
    expect(within(warningDialog).getByText('You are unable to Revoke this record due to its usage in Identity')).toBeVisible()
    await userEvent.click(within(warningDialog).getByRole('button', { name: /OK/i }))

    await waitFor(() => {
      expect(warningDialog).not.toBeVisible()
    })
  })

  it('should close the other drawer when editing passphrase or managing devices', async () => {
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
    await userEvent.click(await screen.findByRole('button', { name: /Manage Devices/i }))

    await waitFor(() => {
      expect(screen.queryAllByRole('dialog').length).toBe(1)
    })
  })

  it('should be able to add device in DpskPassphrase', async () => {
    mockServer.use(
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

    await userEvent.click(screen.getByText(/add another device/i))

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add' })
    )

    await userEvent.click(screen.getAllByText(/cancel/i)[1])

    await userEvent.click(screen.getAllByText(/cancel/i)[0])
  })

  it('should be able to delete device in DpskPassphrase', async () => {
    mockServer.use(
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

  it('should display Status of passphrase', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const revokedRecord = mockedDpskPassphraseList.data.find(p => p.revocationDate)!
    const revokedRow = await screen.findByRole('row', { name: new RegExp(revokedRecord.username) })

    const activeRecord = mockedDpskPassphraseList.data.find(p => !p.expirationDate)!
    const activeRow = await screen.findByRole('row', { name: new RegExp(activeRecord.username) })

    const expiredRecord = mockedDpskPassphraseList.data.find(p => p.expirationDate)!
    const expiredRow = await screen.findByRole('row', { name: new RegExp(expiredRecord.username) })

    expect(await within(revokedRow).findByText('Revoked (2022-12-24 08:00 AM)')).toBeVisible()
    expect(await within(activeRow).findByText('Active')).toBeVisible()
    expect(await within(expiredRow).findByText('Expired')).toBeVisible()
  })

  it('should not be edited when it is mapped to Identity', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[3]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Edit Passphrase/ })).toBeNull()
    })
  })
})
