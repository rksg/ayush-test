import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RulesManagementUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { adaptivePolicyList, templateList } from './__tests__/fixtures'
import { AdaptivePoliciesSelectDrawer }     from './AdaptivePolicySelectDrawer'

jest.mock('./AdaptivePolicyFormDrawer', () => ({
  AdaptivePolicyFormDrawer: () => <div data-testid='AdaptivePolicyFormDrawer' />
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  SimpleListTooltip: () => <div data-testid='SimpleListTooltip' />
}))

const mockedSetVisible = jest.fn()
const mockedSetAccessPolicies = jest.fn()

describe('AdaptivePolicySelectDrawer', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockedSetVisible.mockClear()
    mockedSetAccessPolicies.mockClear()

    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.getPolicyTemplateListByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      )
    )
  })

  it('should render AdaptivePolicySelectDrawer successfully', async () => {
    render(
      <Provider>
        <AdaptivePoliciesSelectDrawer
          visible={true}
          setVisible={mockedSetVisible}
          accessPolicies={[]}
          setAccessPolicies={mockedSetAccessPolicies}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/policies/adaptivePolicySet/create'
        }
      }
    )

    expect(screen.getByText('Select Access Policies')).toBeVisible()
    expect(screen.getByTestId('AdaptivePolicyFormDrawer')).toBeVisible()
  })

  it('should enable adaptive policy successfully', async () => {
    render(
      <Provider>
        <AdaptivePoliciesSelectDrawer
          visible={true}
          setVisible={mockedSetVisible}
          accessPolicies={[]}
          setAccessPolicies={mockedSetAccessPolicies}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/policies/adaptivePolicySet/create'
        }
      }
    )

    const row = await screen.findByRole('row', { name: /ap1/i })
    const switchItem = within(row).getByRole('switch')
    await userEvent.click(switchItem)
    await waitFor(() => expect(switchItem).toBeChecked())
  })

  it('should add adaptive policy successfully', async () => {
    render(
      <Provider>
        <AdaptivePoliciesSelectDrawer
          visible={true}
          setVisible={mockedSetVisible}
          accessPolicies={[]}
          setAccessPolicies={mockedSetAccessPolicies}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/policies/adaptivePolicySet/create'
        }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedSetAccessPolicies).toBeCalled())
  })

  it('should cancel add adaptive policy successfully', async () => {

    render(
      <Provider>
        <AdaptivePoliciesSelectDrawer
          visible={true}
          setVisible={mockedSetVisible}
          accessPolicies={[]}
          setAccessPolicies={mockedSetAccessPolicies}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/policies/adaptivePolicySet/create'
        }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
  })
})
