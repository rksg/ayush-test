import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { policyApi }              from '@acx-ui/rc/services'
import {
  PolicyType,
  ApSnmpUrls,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  PolicyOperation,
  getPolicyListRoutePath,
  LbsServerProfileUrls
} from '@acx-ui/rc/utils'
import { Path, useTenantLink }                    from '@acx-ui/react-router-dom'
import { Provider, store }                        from '@acx-ui/store'
import { render, renderHook, screen, mockServer } from '@acx-ui/test-utils'

import { snmpAgentList } from './__tests__/fixtures'

import SelectPolicyForm from '.'
import { LBS_SERVER_PROFILE_MAX_COUNT } from '@acx-ui/rc/components'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('SelectPolicyForm', () => {

  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    mockServer.use(
      rest.post(ApSnmpUrls.getApSnmpFromViewModel.url, (req, res, ctx) => {
        return res(ctx.json(snmpAgentList))
      })
    )
  })

  const selectPolicyPath = '/:tenantId/' + getSelectPolicyRoutePath()

  it('should navigate to the correct policy page', async () => {
    render(
      <Provider>
        <SelectPolicyForm />
      </Provider>, {
        route: { params, path: '/:tenantId/' + getSelectPolicyRoutePath() }
      }
    )

    await userEvent.click(screen.getByDisplayValue(/Rogue AP Detection/))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    const policyCreatePath = getPolicyRoutePath({
      type: PolicyType.ROGUE_AP_DETECTION,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${policyCreatePath}`
    })
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <SelectPolicyForm />
      </Provider>, {
        route: { params, path: '/:tenantId/' + getSelectPolicyRoutePath() }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /policies & profiles/i
    })).toBeTruthy()
  })

  it('should navigate to the policies list when cancel the form', async () => {
    const { result } = renderHook(() => useTenantLink(getPolicyListRoutePath(true)))

    render(
      <Provider>
        <SelectPolicyForm />
      </Provider>, {
        route: { params, path: selectPolicyPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(result.current)
  })

  it('should render Tunnel Profile when edge is enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE)

    render(
      <Provider>
        <SelectPolicyForm />
      </Provider>, {
        route: { params, path: selectPolicyPath }
      }
    )

    await screen.findByText(/Tunnel Profile/)
  })
  it('should render Port Profile when FF is enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)

    render(
      <Provider>
        <SelectPolicyForm />
      </Provider>, {
        route: { params, path: selectPolicyPath }
      }
    )

    await screen.findByText(/Port Profile/)
  })

  it('should render LBS Server Profile when FF is enabled', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.WIFI_EDA_LBS_TOGGLE)

    render(
      <Provider>
        <SelectPolicyForm />
      </Provider>, {
        route: { params, path: selectPolicyPath }
      }
    )

    await screen.findByText(/Location Based Service Server/)
  })
})
