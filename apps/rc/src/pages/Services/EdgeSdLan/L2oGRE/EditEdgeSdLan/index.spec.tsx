import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi, edgeSdLanApi } from '@acx-ui/rc/services'
import {
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import {
  Provider, store
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EdgeSdLanFormType } from '../Form'

import { EditEdgeSdLan } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const { click } = userEvent

const mockedSubmitDataGen = jest.fn()
const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('../Form', () => ({
  __esModule: true,
  ...jest.requireActual('../Form'),
  EdgeSdLanFormContainer: (props: {
    editData: EdgeSdLanFormType | undefined,
    onFinish: (values: unknown) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div
      data-testid='rc-EdgeSdLanForm'
    >
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))
const mockUpdateEdgeSdLan = jest.fn()
jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  useEdgeSdLanActions: () => ({
    updateEdgeSdLan: (originData: unknown,params: unknown) => {
      if (params && typeof params === 'object' && 'payload' in params) {
        mockUpdateEdgeSdLan((params as { payload: unknown }).payload)
      }
      if (params && typeof params === 'object' && 'callback' in params) {
        (params as { callback: (result: unknown) => void }).callback([])
      }
      return Promise.resolve()
    }
  })
}))

const mockedCdId = 't-cf-id'
const mockedData = {
  id: mockedCdId,
  name: 'testEditDMZSdLanService',
  tunnelProfileId: 't-tunnelProfile-id',
  activatedNetworks: {
    venue_00002: [{
      networkId: 'network_1',
      networkName: 'Network1',
      tunnelProfileId: ''
    }, {
      networkId: 'network_4',
      networkName: 'Network4',
      tunnelProfileId: 't-tunnelProfile-id1'
    }]
  }
}

const targetPath = getServiceRoutePath({
  type: ServiceType.EDGE_SD_LAN,
  oper: ServiceOperation.LIST
})

describe('Edit SD-LAN service', () => {
  beforeEach(() => {
    store.dispatch(edgeSdLanApi.util.resetApiState())
    store.dispatch(edgeApi.util.resetApiState())

    mockedSubmitDataGen.mockReset()
    mockedNavigate.mockReset()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json({ data: mockedMvSdLanDataList }))
        }
      )
    )
  })

  it('should correctly edit service', async () => {
    mockedSubmitDataGen.mockReturnValue(mockedData)

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/t/services/edgeSdLan/:serviceId/edit'
      }
    })
    await click(await screen.findByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(mockUpdateEdgeSdLan).toBeCalledWith({
        name: mockedData.name,
        tunnelProfileId: mockedData.tunnelProfileId,
        activeNetwork: mockedData.activatedNetworks.venue_00002.map(network => ({
          networkId: network.networkId,
          venueId: 'venue_00002',
          tunnelProfileId: network.tunnelProfileId
        }))
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
})
