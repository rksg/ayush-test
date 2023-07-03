import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsTierAllowed, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import {
  ExpirationType,
  getPolicyRoutePath,
  MacRegListUrlsInfo, PolicyOperation, PolicyType, RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }                                                               from '@acx-ui/react-router-dom'
import { Provider }                                                                              from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockedCreateFormData
} from '../../../Services/Dpsk/DpskForm/__tests__/fixtures'

import MacRegistrationListForm from './MacRegistrationListForm'

const mockedTenantId = 'tenant-id'

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

const policySetList = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '50f5cec9-850d-483d-8272-6ee5657f53da',
      name: 'testPolicySet',
      description: 'for test'
    },
    {
      id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
      name: 'testPolicySet1',
      description: 'for test'
    }
  ]
}

const macRegList = {
  id: '373377b0cb6e46ea8982b1c80aabe1fa1',
  autoCleanup: true,
  description: '',
  enabled: true,
  expirationEnabled: true,
  name: 'Registration pool',
  expirationType: ExpirationType.SPECIFIED_DATE,
  expirationDate: '2050-11-02T06:59:59Z',
  defaultAccess: 'REJECT',
  policySetId: policySetList.content[0].id
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
  const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })

  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(macRegList))
      ),
      rest.post(
        MacRegListUrlsInfo.createMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render the form', async ()=> {
    render(
      <Provider>
        <MacRegistrationListForm />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId },
          path: createPath
        }
      }
    )
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <MacRegistrationListForm />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId },
          path: createPath
        }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'MAC Registration Lists'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <MacRegistrationListForm />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId },
          path: createPath
        }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'MAC Registration Lists'
    })).toBeVisible()
  })

  it('should create list successfully', async () => {
    render(
      <Provider>
        <MacRegistrationListForm/>
      </Provider>,
      {
        route: {
          params: { tenantId: mockedTenantId },
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

    const policySet = comboboxElems[1]
    fireEvent.mouseDown(policySet)
    const option = await screen.findAllByText(policySetList.content[0].name)
    await userEvent.click(option[0])

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await screen.findByText('List test was added')
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
        route: { params: { tenantId: mockedTenantId, policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
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
        // eslint-disable-next-line max-len
        route: { params: { tenantId: mockedTenantId, policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
          path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(selectPath.current)
  })
})
