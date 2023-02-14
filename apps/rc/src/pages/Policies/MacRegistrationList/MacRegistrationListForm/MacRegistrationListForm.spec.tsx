import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  ExpirationType,
  getPolicyRoutePath,
  MacRegListUrlsInfo, PolicyOperation, PolicyType
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }                                                    from '@acx-ui/react-router-dom'
import { Provider }                                                                   from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockedCreateFormData
} from '../../../Services/Dpsk/DpskForm/__tests__/fixtures'
import { mockedTenantId } from '../../../Services/MdnsProxy/MdnsProxyForm/__tests__/fixtures'

import MacRegistrationListForm from './MacRegistrationListForm'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

const macRegList = {
  id: '373377b0cb6e46ea8982b1c80aabe1fa1',
  autoCleanup: true,
  description: '',
  enabled: true,
  expirationEnabled: true,
  name: 'Registration pool',
  expirationType: ExpirationType.SPECIFIED_DATE,
  expirationDate: '2050-11-02T06:59:59Z',
  defaultAccess: 'REJECT'
}

const list = {
  content: [
    macRegList
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 1,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 1,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

describe('MacRegistrationListForm', () => {

  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(macRegList))
      ),
      rest.post(
        MacRegListUrlsInfo.createMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render the form', async ()=> {
    render(
      <Provider>
        <MacRegistrationListForm />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
  })

  it('should create list successfully', async () => {
    render(
      <Provider>
        <MacRegistrationListForm/>
      </Provider>,
      {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      })

    await userEvent.type(
      await screen.findByRole('textbox', { name: /name/i }),
      'test'
    )

    const expirationModeElem = screen.getByRole('radio', { name: /After/i })
    await userEvent.click(expirationModeElem)

    const inputNumberElems = await screen.findAllByRole('spinbutton')
    const expirationOffsetElem = inputNumberElems[0]
    expect(expirationOffsetElem).toBeInTheDocument()

    const comboboxElems = await screen.findAllByRole('combobox')
    const expirationTypeElem = comboboxElems[0]
    expect(expirationTypeElem).toBeInTheDocument()

    await userEvent.type(expirationOffsetElem, mockedCreateFormData.expirationOffset!.toString())
    await userEvent.click(expirationTypeElem)
    await userEvent.click(screen.getByText('Days'))

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should edit list and show error Toast', async () => {
    mockServer.use(
      rest.patch(
        MacRegListUrlsInfo.updateMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json({}))
      )
    )
    render(
      <Provider>
        <MacRegistrationListForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id', policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
          path: editPath
        }
      }
    )

    // Verify service name
    const nameInput = await screen.findByDisplayValue(macRegList.name)
    expect(nameInput).toBeInTheDocument()

    await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    const errorMsgElem = await screen.findByText('An error occurred')
    expect(errorMsgElem).toBeInTheDocument()
  })

  it('should add list and show error Toast', async () => {
    mockServer.use(
      rest.post(
        MacRegListUrlsInfo.createMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json({}))
      )
    )
    render(
      <Provider>
        <MacRegistrationListForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: /name/i }),
      'test'
    )

    const expirationModeElem = screen.getByRole('radio', { name: /Never/i })
    await userEvent.click(expirationModeElem)

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const errorMsgElem = await screen.findByText('An error occurred')
    expect(errorMsgElem).toBeInTheDocument()
  })

  it('should edit list successfully', async () => {
    mockServer.use(
      rest.patch(
        MacRegListUrlsInfo.updateMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider><MacRegistrationListForm
        editMode={true}/>
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params: { tenantId: 'tenant-id', policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
          path: editPath }
      })

    await screen.findByRole('heading', { level: 1, name: 'Configure ' + macRegList.name })

    await waitFor(async () => {
      expect(screen.getByLabelText(/name/i)).toHaveValue(macRegList.name)
    })

    await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should navigate to the Select service page when clicking Cancel button', async () => {
    const { result: selectPath } = renderHook(() => {
      // eslint-disable-next-line max-len
      return useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST }))
    })

    render(
      <Provider>
        <MacRegistrationListForm />
      </Provider>, {
        route: { params: { tenantId: 'tenant-id', policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
          path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(selectPath.current)
  })
})
