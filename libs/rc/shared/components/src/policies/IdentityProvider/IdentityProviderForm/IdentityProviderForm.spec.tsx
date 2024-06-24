/* eslint-disable max-len */
import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { policyApi }    from '@acx-ui/rc/services'
import {
  IdentityProviderUrls,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummyIdenetityPrividerData1,
  dummyTableResult,
  mockedPolicyId,
  mockedTenantId
} from '../__tests__/fixtures'

import { IdentityProviderForm } from './IdentityProviderForm'



const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })
const editPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.EDIT })


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))


jest.mock('./NetworkIdentifierForm', () => ({
  ...jest.requireActual('./NetworkIdentifierForm'),
  __esModule: true,
  default: () => <div data-testid={'network-identifier-form'} children={'mockNetworkIdentifierForm'} />
}))

jest.mock('./AaaSettingsForm', () => ({
  ...jest.requireActual('./AaaSettingsForm'),
  __esModule: true,
  default: () => <div data-testid={'aaa-settings-form'} children={'mockAaaSettingsForm'} />
}))

jest.mock('./SummaryForm', () => ({
  ...jest.requireActual('./SummaryForm'),
  __esModule: true,
  default: () => <div data-testid={'summary-form'} children={'mockSummaryForm'} />
}))

describe('IdentityProviderForm', () => {
  const mockGetProfileApi = jest.fn()
  const mockAddFn = jest.fn()
  const mockEditFn = jest.fn()

  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    mockAddFn.mockClear()
    mockEditFn.mockClear()
    mockGetProfileApi.mockClear()
    mockedUseNavigate.mockClear()

    mockServer.use(
      rest.post(
        IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.get(
        IdentityProviderUrls.getIdentityProvider.url,
        (_, res, ctx) => {
          mockGetProfileApi()
          return res(ctx.json(dummyIdenetityPrividerData1))
        }
      ),
      rest.post(
        IdentityProviderUrls.addIdentityProvider.url,
        (_, res, ctx) => {
          mockAddFn()
          return res(ctx.json({ response: { id: mockedPolicyId } }))
        }
      ),
      rest.put(
        IdentityProviderUrls.updateIdentityProvider.url,
        (_, res, ctx) => {
          mockEditFn()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        IdentityProviderUrls.activateIdentityProviderRadius.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        IdentityProviderUrls.activateIdentityProviderRadius.url,
        (_, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Render component with create mode successfully', async () => {
    render(
      <Provider>
        <IdentityProviderForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    expect(await screen.findByText('Add Identity Provider')).toBeInTheDocument()
    // In create mode doesn't call the getting profile API
    expect(mockGetProfileApi).not.toBeCalled()

    expect(await screen.findByTestId('network-identifier-form')).toBeInTheDocument()

    // goto next page
    const nextBtn = await screen.findByRole('button', { name: 'Next' })
    await userEvent.click(nextBtn)
    expect(nextBtn).toBeDisabled()
    await waitFor(() => { expect(nextBtn).toBeEnabled() })
    expect(await screen.findByTestId('aaa-settings-form')).toBeInTheDocument()

    // next to the final page
    await userEvent.click(nextBtn)
    expect(nextBtn).toBeDisabled()
    await waitFor(() => { expect(nextBtn).toBeEnabled() })
    expect(await screen.findByTestId('summary-form')).toBeInTheDocument()

    const addBtn = await screen.findByRole('button', { name: 'Add' })
    expect(addBtn).toBeVisible()

    await userEvent.click(addBtn)
    expect(mockAddFn).toBeCalled()
  })

  it('The page will be redirected after click the Cancel button', async () => {
    render(
      <Provider>
        <IdentityProviderForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/__Tenant_ID__/t/policies/identityProvider/list',
      hash: '',
      search: ''
    }, { replace: true })
  })

  it('Render component with edit mode successfully', async () => {
    render(
      <Provider>
        <IdentityProviderForm editMode={true} />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId }, path: editPath }
      }
    )

    expect(await screen.findByText('Edit Identity Provider')).toBeInTheDocument()

    expect(mockGetProfileApi).toBeCalled()

    await userEvent.click(await screen.findByText('AAA Settings'))
    expect(await screen.findByTestId('aaa-settings-form')).toBeInTheDocument()

    await userEvent.click(await screen.findByText('Network Identifier'))
    expect(await screen.findByTestId('network-identifier-form')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockEditFn).toBeCalled()
  })
})