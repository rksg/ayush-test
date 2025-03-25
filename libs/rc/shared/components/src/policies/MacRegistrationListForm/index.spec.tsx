import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                   from '@acx-ui/feature-toggle'
import {
  ExpirationType,
  getPolicyRoutePath,
  MacRegListUrlsInfo, PersonaUrls, PolicyOperation, PolicyType, RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }                                    from '@acx-ui/react-router-dom'
import { Provider }                                                   from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { mockedCreateFormData } from './__tests__/fixtures'

import { MacRegistrationListForm } from './index'

const mockedTenantId = 'tenant-id'

const mockedUseNavigate = jest.fn()
const mockedBindPolicySet = jest.fn()
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

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useUpdateAdaptivePolicySetToMacListMutation: () => [mockedBindPolicySet]
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
  policySetId: policySetList.content[0].id,
  identityGroupId: 'e4dca1f2-39a6-48c2-84dd-0bf8e2d14b9a'
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

const groupList = {
  content: [
    {
      id: 'e4dca1f2-39a6-48c2-84dd-0bf8e2d14b9a',
      name: '0000-mandatory-test-auto-generated',
      description: null,
      dpskPoolId: 'c4a02abcf2614d2681afc4ef9401b2db',
      macRegistrationPoolId: null,
      propertyId: null,
      createdAt: '2024-12-03T02:21:18.714163Z',
      updatedAt: '2024-12-03T02:21:18.714163Z',
      certificateTemplateId: null,
      policySetId: null,
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 0
    }
  ],
  pageable: {
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    pageNumber: 0,
    pageSize: 2000,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  last: true,
  totalElements: 35,
  size: 2000,
  number: 0,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  first: true,
  numberOfElements: 35,
  empty: false
}

const identityGroup = {
  id: 'e4dca1f2-39a6-48c2-84dd-0bf8e2d14b9a',
  name: 'blockTestGroup',
  description: null,
  dpskPoolId: '01ea012e8b8148b2b00c30d282fa3aa4',
  macRegistrationPoolId: null,
  propertyId: null,
  createdAt: 1728369478.325496000,
  updatedAt: 1728369517.592284000,
  certificateTemplateId: 'd87bf58e3e8a4310a36245371b88e12b',
  policySetId: null,
  personalIdentityNetworkId: null,
  identities: [
    {
      id: 'd8dbe53d-ec1e-4205-9d95-ed7c7bba3c2a',
      groupId: '01b44fc1-f1b0-4679-baef-e28abb8f453c',
      parentId: null,
      description: null,
      name: 'userBlock',
      email: null,
      dpskGuid: '6ee1e85787614b0d904acc1259597e89',
      dpskPassphrase: '<#pyU2eHB+ylVt&8-*',
      identityId: null,
      revoked: true,
      vlan: null,
      vni: null,
      createdAt: 1728369552.231506000,
      updatedAt: 1728369654.054783000,
      devices: [],
      deviceCount: 0,
      ethernetPorts: [],
      switches: [],
      meteringProfileId: null,
      expirationDate: null,
      primary: true,
      links: []
    }
  ],
  identityCount: null
}

describe('MacRegistrationListForm', () => {

  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

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
        (req, res, ctx) => res(ctx.json(macRegList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPolicySetsByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.delete(
        MacRegListUrlsInfo.deleteAdaptivePolicySet.url,
        (req, res, ctx) => res(ctx.json('12345'))
      ),
      rest.put(
        MacRegListUrlsInfo.updateAdaptivePolicySet.url,
        (req, res, ctx) => res(ctx.json('12345'))
      ),
      rest.patch(
        MacRegListUrlsInfo.updateMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(macRegList))
      ),
      rest.post(
        MacRegListUrlsInfo.createMacRegistrationPoolWithIdentity.url,
        (req, res, ctx) => res(ctx.json(macRegList))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(identityGroup))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )
    jest.clearAllMocks()
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

  it('should render breadcrumb correctly', async () => {
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

    const identityGroup = comboboxElems[1]
    expect(identityGroup).toBeInTheDocument()
    fireEvent.mouseDown(identityGroup)
    const groupOption = await screen.findAllByText(groupList.content[0].name)
    await userEvent.click(groupOption[0])

    await userEvent.type(expirationOffsetElem, mockedCreateFormData.expirationOffset!.toString())
    await userEvent.click(expirationTypeElem)
    await userEvent.click(screen.getByText('Days'))

    const policySet = comboboxElems[2]
    fireEvent.mouseDown(policySet)
    const option = await screen.findAllByText(policySetList.content[0].name)
    await userEvent.click(option[0])

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedBindPolicySet).toBeCalledTimes(1))
    await waitFor(() => expect(mockedUseNavigate).toBeCalledTimes(1))
  })

  it('should edit list successfully', async () => {
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

    await waitFor(() => expect(mockedUseNavigate).toBeCalledTimes(1))
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

  it('should create list with identity error', async () => {
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

    const identityGroup = comboboxElems[1]
    expect(identityGroup).toBeInTheDocument()
    fireEvent.mouseDown(identityGroup)
    const groupOption = await screen.findAllByText(groupList.content[0].name)
    await userEvent.click(groupOption[0])

    // eslint-disable-next-line max-len
    const useSingleIdentityElem = await screen.findByText('Use Single Identity for all connections')
    await userEvent.click(useSingleIdentityElem)

    await userEvent.type(expirationOffsetElem, mockedCreateFormData.expirationOffset!.toString())
    await userEvent.click(expirationTypeElem)
    await userEvent.click(screen.getByText('Days'))

    const policySet = comboboxElems[2]
    fireEvent.mouseDown(policySet)
    const option = await screen.findAllByText(policySetList.content[0].name)
    await userEvent.click(option[0])

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUseNavigate).toBeCalledTimes(0))
  })
})
