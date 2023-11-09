import userEvent        from '@testing-library/user-event'
import { FormInstance } from 'antd'
import { rest }         from 'msw'

import { EdgeCentralizedForwardingUrls, EdgeUrlsInfo, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockEdgeList }                   from '../__tests__/fixtures'
import { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'

import EditEdgeCentralizedForwarding from '.'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedEditFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../CentralizedForwardingForm', () => ({
  ...jest.requireActual('../CentralizedForwardingForm'),
  default: (props: {
    form: FormInstance,
    onFinish: (values: CentralizedForwardingFormModel) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div
      data-testid='rc-CentralizedForwardingForm'
    >
      <button onClick={(e) => {
        e.preventDefault()
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

describe('Edit Edge Centralized Forwarding service', () => {
  beforeEach(() => {
    mockedEditFn.mockReset()
    mockedSubmitDataGen.mockReset()

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeCentralizedForwardingUrls.getEdgeCentralizedForwarding.url,
        (_, res, ctx) => res(ctx.json({ data: {} }))
      ),
      rest.patch(
        EdgeCentralizedForwardingUrls.updateEdgeCentralizedForwardingPartial.url,
        (req, res, ctx) => {
          mockedEditFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly edit service', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      name: 'testEditCFService'
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
      oper: ServiceOperation.LIST
    })

    render(<Provider>
      <EditEdgeCentralizedForwarding />
    </Provider>, {
      route: { params: { tenantId: 't-id', serviceId: 't-cf-id' } }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({ name: 'testEditCFService' })
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
