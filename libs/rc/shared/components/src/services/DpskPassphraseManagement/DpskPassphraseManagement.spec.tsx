import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                                 from '@acx-ui/feature-toggle'
import { clientApi, networkApi, serviceApi, useGetEnhancedDpskPassphraseListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation,
  DpskUrls,
  CommonUrlsInfo,
  ClientUrlsInfo, PersonaUrls,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  mockedDpskPassphraseList,
  mockedTenantId,
  mockedServiceId,
  mockedDpskPassphrase,
  mockedDpskPassphraseDevices,
  mockedIdentityList
} from './__tests__/fixtures'
import { DpskPassphraseManagement } from './DpskPassphraseManagement'

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

const mockFormData = new FormData()

jest.mock('../../ImportFileDrawer', () => ({
  NetworkForm: () => <div data-testid='network-form' />,
  PassphraseViewer: () => <div data-testid='PassphraseViewer' />,
  ImportFileDrawer: ({ importRequest, onClose, visible }: {
    visible: boolean
    importRequest: (formData: FormData, values: object) => void
    onClose: () => void
  }) =>
    visible && <div data-testid={'ImportFileDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        importRequest(mockFormData, { usernamePrefix: 'prefix' })
      }}>Import</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>,
  CsvSize: {},
  ImportFileDrawerType: {}
}))

jest.mock('./DpskPassphraseDrawer', () => ({
  ...jest.requireActual('./DpskPassphraseDrawer'),
  __esModule: true,
  default: () => <div data-testid='DpskPassphraseDrawer'></div>
}))

describe('DpskPassphraseManagement', () => {
  const paramsForPassphraseTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
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
      ),
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], page: 1, totalCount: 0 }))
      ),
      rest.post(
        ClientUrlsInfo.getClientMeta.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (_req, res, ctx) => {
          return res(ctx.json(mockedIdentityList))
        }
      )
    )
  })
  const utils = require('@acx-ui/rc/utils')
  jest.mock('@acx-ui/rc/utils', () => ({
    ...jest.requireActual('@acx-ui/rc/utils')
  }))

  utils.useTableQuery = jest.fn().mockImplementation(() => {
    return {
      ...mockedDpskPassphraseList,
      data: {
        data: mockedDpskPassphraseList.data
      }
    }
  })

  it('should render the Passphrase Management view', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetUsername = new RegExp(mockedDpskPassphraseList.data[0].username)
    expect(await screen.findByRole('row', { name: targetUsername })).toBeVisible()

    // Verify Add Passphrases
    await userEvent.click(await screen.findByRole('button', { name: /Add Passphrases/ }))
    expect(await screen.findByTestId('DpskPassphraseDrawer')).toBeVisible()
  })

  it('should delete selected passphrase', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    mockServer.use(
      rest.delete(
        DpskUrls.deletePassphrase.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
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
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[3]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    expect(screen.getByRole('button', { name: /Delete/ })).toBeDisabled()
  })

  it('should show error message when import CSV file failed', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

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
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Import From File/ }))
    const importDialog = await screen.findByTestId('ImportFileDrawer')
    await userEvent.click(await within(importDialog).findByRole('button', { name: /Import/ }))

    // TODO
    // expect(await screen.findByText('An error occurred')).toBeVisible()
  })

  it('should export the passphrases', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    mockedDownloadCsv.mockImplementation(() => ({
      unwrap: () => Promise.resolve()
    }))
    mockedDownloadNewFlowCsv.mockImplementation(() => ({
      unwrap: () => Promise.resolve()
    }))

    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Export To File/ }))
    await waitFor(() => expect(mockedDownloadNewFlowCsv).toHaveBeenCalledTimes(1))

    jest.mocked(useIsSplitOn).mockReset()
  })

  it('should render the edit passphrase view', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Edit Passphrase/i }))

    expect(await screen.findByTestId('DpskPassphraseDrawer')).toBeVisible()
  })

  it.skip('should revoke/unrevoke the passphrases', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

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
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
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
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
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

  it.skip('should be able to add device in DpskPassphrase', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    mockServer.use(
      rest.patch(
        DpskUrls.updatePassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'req1' }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Manage Devices' }))

    await screen.findByText(/ad:2c:3b:1d:4d:4e/i)

    await userEvent.click(await screen.findByRole('button', { name: /add device/i }))

    const addDeviceDialog = await screen.findByRole('dialog', { name: /add device/i })

    await userEvent.type(
      within(addDeviceDialog).getByRole('textbox', { name: 'MAC Address' }),
      '11:22:33:44:55:66'
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => expect(addDeviceDialog).not.toBeVisible())

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it.skip('should be able to delete device in DpskPassphrase', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    mockServer.use(
      rest.delete(
        DpskUrls.deletePassphraseDevices.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'req2' }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Manage Devices' }))

    const dialog = await screen.findByRole('dialog')
    const targetDevice = await within(dialog).findByRole('row', { name: /ad:2c:3b:1d:4d:4e/i })

    await userEvent.click(within(targetDevice).getByRole('checkbox'))
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(within(dialog).queryByRole('button', { name: 'Delete' })).toBeNull()
    })

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should display Status of passphrase', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const rows = await screen.findAllByRole('row')
    const revokedRecord = mockedDpskPassphraseList.data.find(p => p.revocationDate)!
    expect(within(rows[3]).getByRole('cell',
      { name: new RegExp(revokedRecord.username) })).toBeVisible()
    const revokedRow = rows[3]

    const activeRecord = mockedDpskPassphraseList.data.find(p => !p.expirationDate)!
    expect(within(rows[4]).getByRole('cell',
      { name: new RegExp(activeRecord.username) })).toBeVisible()
    const activeRow = rows[4]

    const expiredRecord = mockedDpskPassphraseList.data.find(p => p.expirationDate)!
    expect(within(rows[1]).getByRole('cell',
      { name: new RegExp(expiredRecord.username) })).toBeVisible()
    const expiredRow = rows[1]

    expect(within(revokedRow).getByText('Revoked (2022-12-24 08:00 AM)')).toBeVisible()
    expect(within(activeRow).getByText('Active')).toBeVisible()
    expect(within(expiredRow).getByText('Expired')).toBeVisible()
  })

  it('should not be edited when it is mapped to Identity', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[3]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    await screen.findByRole('button', { name: 'Revoke' })
    expect(screen.queryByRole('button', { name: /Edit Passphrase/ })).toBeNull()
  })

  it('should be editable when when identity group is mandatory', async () => {
    const { result: dpskQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetEnhancedDpskPassphraseListQuery,
        defaultPayload: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DPSK_REQUIRE_IDENTITY_GROUP)
    render(
      <Provider>
        <DpskPassphraseManagement serviceId={mockedServiceId} tableQuery={dpskQuery.current}/>
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.data[3]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: /Edit Passphrase/ })).toBeVisible()
  })
})
