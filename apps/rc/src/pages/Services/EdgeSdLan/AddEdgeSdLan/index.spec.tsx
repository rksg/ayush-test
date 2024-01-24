import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeSdLanUrls, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EdgeSdLanFormModel } from '../EdgeSdLanForm'

import AddEdgeSdLan from '.'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../EdgeSdLanForm', () => ({
  __esModule: true,
  ...jest.requireActual('../EdgeSdLanForm'),
  default: (props: {
    onFinish: (values: EdgeSdLanFormModel) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-EdgeSdLanForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

describe('Add SD-LAN service', () => {
  beforeEach(() => {
    mockedAddFn.mockReset()
    mockedSubmitDataGen.mockReset()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.addEdgeSdLan.url,
        (req, res, ctx) => {
          mockedAddFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly add service', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      name: 'testAddSdLanService',
      edgeId: '0000000001',
      corePortMac: 't-coreport-mac',
      tunnelProfileId: 't-tunnelProfile-id',
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }]
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.LIST
    })

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeEdgeSdLan/create'
      }
    })

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: 'testAddSdLanService',
        edgeId: '0000000001',
        corePortMac: 't-coreport-mac',
        tunnelProfileId: 't-tunnelProfile-id',
        networkIds: ['network_1']
      })
    })
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })
  it('network is allowed to be empty', async () => {
    mockedSubmitDataGen.mockReturnValue({
      name: 'testAddSdLanService2',
      edgeId: '0000000002',
      corePortMac: 't-coreport2-mac',
      tunnelProfileId: 't-tunnelProfile2-id',
      activatedNetworks: []
    })

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeEdgeSdLan/create'
      }
    })

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: 'testAddSdLanService2',
        edgeId: '0000000002',
        corePortMac: 't-coreport2-mac',
        tunnelProfileId: 't-tunnelProfile2-id',
        networkIds: []
      })
    })
    expect(mockedAddFn).toBeCalledTimes(1)
    await waitFor(() => {
      expect(mockedNavigate).toBeCalled()
    })
  })
})
