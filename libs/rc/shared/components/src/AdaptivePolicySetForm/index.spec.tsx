import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  policySetList,
  prioritizedPolicies
} from './__tests__/fixtures'

import { AdaptivePolicySetForm } from '.'

jest.mock('./AdaptivePolicySetSettingForm', () => ({
  AdaptivePolicySetSettingForm: () => <div data-testid='AdaptivePolicySetSettingForm' />
}))

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedModalCallback = jest.fn()
const createPolicySetBeingCalled = jest.fn()
const updatePolicySetBeingCalled = jest.fn()
const removePrioritizedAssignmentBeingCalled = jest.fn()

describe('AdaptivePolicySetForm', () => {
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.EDIT })

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    createPolicySetBeingCalled.mockClear()
    updatePolicySetBeingCalled.mockClear()

    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.createPolicySet.url,
        (req, res, ctx) => {
          createPolicySetBeingCalled()
          return res(ctx.json({
            id: 'policy_id'
          }))
        }
      ),
      rest.put(
        RulesManagementUrlsInfo.assignPolicyPriority.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.delete(
        RulesManagementUrlsInfo.removePrioritizedAssignment.url,
        (req, res, ctx) => {
          removePrioritizedAssignmentBeingCalled()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySet.url,
        (req, res, ctx) => res(ctx.json(policySetList.content[0]))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.patch(
        RulesManagementUrlsInfo.updatePolicySet.url,
        (req, res, ctx) => {
          updatePolicySetBeingCalled()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render create mode form successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    expect(await screen.findByText('Add Adaptive Policy Set')).toBeVisible()
  })

  it('should render edit mode form successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm editMode={true}/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id', policyId: 'policy-id' },
          path: editPath
        }
      }
    )
    expect(await screen.findByText('Configure ps12')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Adaptive Policy Sets'
    })).toBeVisible()
  })

  it('should navigate to list page when click cancel btn', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/' + getPolicyRoutePath({
        type: PolicyType.ADAPTIVE_POLICY_SET,
        oper: PolicyOperation.LIST
      }),
      hash: '',
      search: ''
    }))
  })

  it('should excute modal callback when click cancel btn in modal mode', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm
          modalCallBack={mockedModalCallback}
          modalMode
        />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedModalCallback).toBeCalled())
  })

  it('should create adaptive policy successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(createPolicySetBeingCalled).toBeCalled())
    expect(await screen.findByText('Policy Set was added')).toBeVisible()
  })

  it('should update adaptive policy successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm editMode />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id', policyId: 'policy-id' },
          path: editPath
        }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(updatePolicySetBeingCalled).toBeCalled())
    await waitFor(() => expect(removePrioritizedAssignmentBeingCalled).toBeCalled())
    expect(await screen.findByText('Policy Set was updated')).toBeVisible()
  })
})
