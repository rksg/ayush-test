import userEvent from '@testing-library/user-event'

import { getServiceListRoutePath } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

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
jest.mock('../CentralizedForwardingForm/SettingsForm', () => ({
  ...jest.requireActual('../CentralizedForwardingForm/SettingsForm'),
  SettingsForm: () => <div data-testid='rc-SettingsForm'></div>
}))
jest.mock('../CentralizedForwardingForm/ScopeForm', () => ({
  ...jest.requireActual('../CentralizedForwardingForm/ScopeForm'),
  ScopeForm: () => <div data-testid='rc-ScopeForm'></div>
}))
jest.mock('../CentralizedForwardingForm/SummaryForm', () => ({
  ...jest.requireActual('../CentralizedForwardingForm/SummaryForm'),
  SummaryForm: () => <div data-testid='rc-SummaryForm'></div>
}))

describe('Edit Edge Centralized Forwarding service', () => {
  beforeEach(() => {
    mockedEditFn.mockReset()
    mockedSubmitDataGen.mockReset()
  })

  it('should correctly add service', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      serviceName: 'testEditCFService'
    })
    // TODO: this should redirect to CF service list when page is ready
    // const targetPath = getServiceRoutePath({
    //   type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
    //   oper: ServiceOperation.LIST
    // })
    const targetPath = getServiceListRoutePath()

    render(<EditEdgeCentralizedForwarding />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    // TODO: submit data assertion when API ready.
    // await waitFor(() => {
    //   expect(mockedAddFn).toBeCalledWith({ serviceName: 'mockedServiceName' })
    // })
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })
})
