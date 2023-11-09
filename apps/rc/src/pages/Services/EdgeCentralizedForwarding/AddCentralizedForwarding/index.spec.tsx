import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeCentralizedForwardingUrls, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'

import AddEdgeCentralizedForwarding from '.'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../CentralizedForwardingForm', () => ({
  ...jest.requireActual('../CentralizedForwardingForm'),
  default: (props: {
    onFinish: (values: CentralizedForwardingFormModel) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-CentralizedForwardingForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

describe('Add Edge Centralized Forwarding service', () => {
  beforeEach(() => {
    mockedAddFn.mockReset()
    mockedSubmitDataGen.mockReset()

    mockServer.use(
      rest.post(
        EdgeCentralizedForwardingUrls.addEdgeCentralizedForwarding.url,
        (req, res, ctx) => {
          mockedAddFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly add service', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      name: 'testAddCFService',
      activatedNetworks: []
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
      oper: ServiceOperation.LIST
    })

    render(<AddEdgeCentralizedForwarding />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: 'testAddCFService',
        networkIds: []
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
