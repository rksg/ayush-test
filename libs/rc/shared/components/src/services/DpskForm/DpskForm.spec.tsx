import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  DpskUrls,
  getServiceRoutePath,
  ServiceType,
  ServiceOperation,
  RulesManagementUrlsInfo, PersonaUrls
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { websocketServerUrl } from '@acx-ui/utils'

import {
  createPath,
  editPath,
  mockedCreateFormData,
  mockedEditFormData,
  mockedTenantId,
  mockedServiceId,
  mockedDpskList,
  policySetList, identityGroupList, mockedPolicySet
} from './__tests__/fixtures'
import { DpskForm } from './DpskForm'


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

describe('DpskForm', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        DpskUrls.addDpsk.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCreateFormData }))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({ ...mockedEditFormData }))
      ),
      rest.get(
        DpskUrls.getDpskList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedDpskList }))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        DpskUrls.createDpskWithIdentityGroup.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCreateFormData }))
      )
    )
  })

  it('should create a DPSK service profile', async () => {
    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Set Service Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Service Name/i }),
      'FakeDPSK'
    )

    // Set Passphrase Format
    await userEvent.click(screen.getByRole('combobox', { name: /Passphrase Format/i }))
    await userEvent.click(screen.getByText('Numbers Only'))

    // Set Passphrase Length
    const passphraseLengthElem = screen.getByRole('spinbutton', { name: /Passphrase Length/i })
    await userEvent.clear(passphraseLengthElem)
    await userEvent.type(passphraseLengthElem, '16')

    // Set List Expiration (After time)
    const expirationModeElem = screen.getByRole('radio', { name: /After/i })
    await userEvent.click(expirationModeElem)

    const inputNumberElems = await screen.findAllByRole('spinbutton')
    const expirationOffsetElem = inputNumberElems[1]
    expect(expirationOffsetElem).toBeInTheDocument()
    await userEvent.type(expirationOffsetElem, '5')

    const comboboxElems = await screen.findAllByRole('combobox')
    const expirationTypeElem = comboboxElems[1]
    expect(expirationTypeElem).toBeInTheDocument()
    await userEvent.click(expirationTypeElem)
    await userEvent.click(screen.getByText('Days'))

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledTimes(1))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'My Services' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'DPSK' })).toBeVisible()
  })

  it('should render Edit form', async () => {
    render(
      <Provider>
        <DpskForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    // Verify service name
    const nameInput = await screen.findByDisplayValue(mockedEditFormData.name)
    expect(nameInput).toBeInTheDocument()
  })

  it('should render Edit form with cloudpath FF enabled', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({
          ...mockedEditFormData,
          policySetId: 'a3a8449e-a649-4bf4-8798-d772ee1dbd5f',
          policyDefaultAccess: false
        }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    expect(await screen.findByRole('radio', { name: /REJECT/ })).toBeChecked()
    jest.mocked(useIsTierAllowed).mockReset()
  })

  it('should navigate to the DPSK table when clicking Cancel button', async () => {
    const { result: selectServicePath } = renderHook(() => {
      // eslint-disable-next-line max-len
      return useTenantLink(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }))
    })

    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(selectServicePath.current.pathname)
  })

  it('should render the form for Modal mode', async () => {
    const mockedModalCallBack = jest.fn()

    render(
      <Provider>
        <DpskForm editMode={false} modalMode={true} modalCallBack={mockedModalCallBack} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedModalCallBack).toHaveBeenCalled()
  })

  // eslint-disable-next-line max-len
  it('should create a DPSK service profile with an update request to policySetId with RBAC enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === Features.CLOUDPATH_BETA)
    const updateFn = jest.fn()

    mockServer.use(
      rest.put(
        DpskUrls.updateDpskPolicySet.url,
        (req, res, ctx) => res(
          updateFn(),
          ctx.json({ requestId: '12345' })
        )
      ),
      rest.post(
        DpskUrls.addDpsk.url,
        (req, res, ctx) => res(ctx.json({ id: '12345', requestId: '12345' }))
      )
    )

    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Set Service Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Service Name/i }),
      'FakeDPSK'
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Adaptive Policy Set/i }))

    // wait for the policy set list to be loaded
    await userEvent.click(await screen.findByText(policySetList.content[0].name))

    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[1])
    await waitFor(() => expect(updateFn).toBeCalled())
  })

  it('should invoke policySet API when editing the DPSK profile with RBAC enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === Features.CLOUDPATH_BETA)
    const getFn = jest.fn()
    const updateFn = jest.fn()
    const getPolicySetsFn = jest.fn()

    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(
          getFn(),
          ctx.json({ ...mockedEditFormData }))
      ),
      rest.put(
        DpskUrls.updateDpsk.url,
        (req, res, ctx) => res(ctx.json({ requestId: '12345' }))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(
          getPolicySetsFn(),
          ctx.json(policySetList)
        )
      ),
      rest.put(
        DpskUrls.updateDpskPolicySet.url,
        (req, res, ctx) => res(
          updateFn(),
          ctx.json({ requestId: '12345' })
        )
      )
    )

    render(
      <Provider>
        <DpskForm editMode={true}/>
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    await waitFor(() => expect(getPolicySetsFn).toBeCalled())

    await userEvent.click(screen.getByRole('combobox', { name: /Adaptive Policy Set/i }))
    await userEvent.click(await screen.findByText(policySetList.content[0].name))

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(getFn).toBeCalled())
    await waitFor(() => expect(updateFn).toBeCalled())
  })

  // eslint-disable-next-line max-len
  it('should create a DPSK service profile with identity group id with DPSK_REQUIRE_IDENTITY_GROUP enabled', async () => {
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === Features.CLOUDPATH_BETA)
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.RBAC_SERVICE_POLICY_TOGGLE ||
      ff === Features.DPSK_REQUIRE_IDENTITY_GROUP
    )
    const updateFn = jest.fn()
    const createDpskWithIdentityGroupFn = jest.fn()

    mockServer.use(
      rest.put(
        DpskUrls.updateDpskPolicySet.url,
        (req, res, ctx) => res(
          updateFn(),
          ctx.json({ requestId: '12345' })
        )
      ),
      rest.post(
        RulesManagementUrlsInfo.getPolicyTemplateListByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedPolicySet))
      ),
      rest.post(
        DpskUrls.createDpskWithIdentityGroup.url,
        (req, res, ctx) => res(
          createDpskWithIdentityGroupFn(),
          ctx.json({ id: '12345', requestId: '12345' }))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.replace('?size=:pageSize&page=:page&sort=:sort', ''),
        (req, res, ctx) => res(ctx.json(identityGroupList))
      )
    )

    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Set Service Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Service Name/i }),
      'FakeDPSK'
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Identity Group/i }))

    // wait for the policy set list to be loaded
    await userEvent.click(await screen.findByText(identityGroupList.content[0].name))

    await userEvent.click(screen.getByRole('combobox', { name: /Adaptive Policy Set/i }))

    // wait for the policy set list to be loaded
    await userEvent.click(await screen.findByText(policySetList.content[0].name))

    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[2])

    await waitFor(() => expect(createDpskWithIdentityGroupFn).toBeCalled())
    await waitFor(() => expect(updateFn).toBeCalled())
  })
})
