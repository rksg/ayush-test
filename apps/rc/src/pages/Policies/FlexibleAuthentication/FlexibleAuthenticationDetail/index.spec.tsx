import { rest } from 'msw'

import { switchApi }    from '@acx-ui/rc/services'
import {
  SwitchUrlsInfo,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { store, Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { flexAuthList, appliedTargets } from '../__tests__/fixtures'

import FlexibleAuthenticationDetail from '.'

const mockedUpdateProfile = jest.fn()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('FlexibleAuthenticationDetail', ()=>{
  let params: { tenantId: string, policyId: string }
  params = {
    tenantId: 'tenant-id',
    policyId: '7de28fc02c0245648dfd58590884bad2'
  }
  const profileDetailPath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.DETAIL,
    policyId: params.policyId
  })

  beforeEach(() => {
    mockedUpdateProfile.mockClear()
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json(flexAuthList))
      ),
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfileAppliedTargets.url,
        (req, res, ctx) => res(ctx.json({ data: appliedTargets }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationDetail />
      </Provider>, {
        route: { params, path: profileDetailPath }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Profile01--auth10-guest5')).toBeVisible()
    expect(await screen.findByText('Instances (2)')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationDetail />
      </Provider>, {
        route: { params, path: profileDetailPath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Authentication' })).toBeVisible()
  })

  it('should render correctly when some data fields are empty.', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json({
          ...flexAuthList,
          data: [flexAuthList?.data[1]]
        }))
      )
    )

    render(
      <Provider>
        <FlexibleAuthenticationDetail />
      </Provider>, {
        route: { params, path: profileDetailPath }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Profile02--auth1-guest5')).toBeVisible()
    expect(await screen.findAllByText('--')).toHaveLength(2)
    expect(await screen.findByText('Instances (2)')).toBeVisible()
  })
})
