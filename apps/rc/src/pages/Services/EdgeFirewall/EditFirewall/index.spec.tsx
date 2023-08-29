import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeFirewallSetting,
  EdgeFirewallUrls } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockFirewall }      from '../__tests__/fixtures'
import { FirewallFormModel } from '../FirewallForm'

import EditFirewall from './'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedFinished = jest.fn()
const mockedGetRuleSubmitData = jest.fn()
const mockedGetFn = jest.fn()
const mockedUpdateFn = jest.fn()

jest.mock('../FirewallForm', () => ({
  ...jest.requireActual('../FirewallForm'),
  default: (props: {
    onFinish: (values: FirewallFormModel) => Promise<boolean | void>
    editMode: boolean
    editData: EdgeFirewallSetting
  }) => {
    const submitData = mockedGetRuleSubmitData()
    return props.editData && <div data-testid='rc-FirewallForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))
describe('Edit edge firewall service', () => {
  beforeEach(() => {
    mockedFinished.mockReset()
    mockedGetRuleSubmitData.mockReset()
    mockedGetFn.mockReset()
    mockedUpdateFn.mockReset()

    mockServer.use(
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => {
          mockedGetFn()
          return res(ctx.json(mockFirewall))
        }
      ),
      rest.put(
        EdgeFirewallUrls.updateEdgeFirewall.url,
        (req, res, ctx) => {
          mockedUpdateFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly transform selectedEdges into edgeIds', async () => {
    mockedGetRuleSubmitData.mockReturnValueOnce({
      id: 'mock-id',
      serviceName: 'test123',
      edgeIds: ['0000000002', '0000000003'],
      selectedEdges: [{
        name: 'Smart Edge 2',
        serialNumber: '0000000002'
      }, {
        name: 'Smart Edge 3',
        serialNumber: '0000000003'
      }],
      tags: [],
      ddosRateLimitingEnabled: true,
      ddosRateLimitingRules: [],
      statefulAclEnabled: true,
      statefulAcls: []
    })

    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })

    const form = within(await screen.findByTestId('rc-FirewallForm'))
    await waitFor(() => {
      expect(mockedGetFn).toBeCalled()
    })
    await click(form.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(mockedUpdateFn).toBeCalledWith({
        serviceName: 'test123',
        edgeIds: ['0000000002', '0000000003'],
        ddosRateLimitingEnabled: true,
        ddosRateLimitingRules: [],
        statefulAclEnabled: true,
        statefulAcls: []
      })
    })

    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/services/edgeFirewall/list',
        search: ''
      },
      { replace: true })
    })
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<EditFirewall />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  })
})
