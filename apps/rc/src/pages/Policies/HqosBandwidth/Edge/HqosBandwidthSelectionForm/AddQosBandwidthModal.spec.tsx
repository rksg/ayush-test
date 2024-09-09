import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeQosProfilesUrls }                         from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { QosBandwidthFormModel } from '../QosBandwidthForm'

import { AddQosBandwidthModal } from './AddQosBandwidthModal'
const { click } = userEvent
const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../QosBandwidthForm', () => ({
  __esModule: true,
  ...jest.requireActual('../QosBandwidthForm'),
  default: (props: {
    onFinish: (values: QosBandwidthFormModel) => Promise<boolean | void>
    onCancel: () => void
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-QosBandwidthForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
      <button onClick={() => {
        props.onCancel()
      }}>Cancel</button>
    </div>
  }
}))

const params = { tenantId: 't-id' }

describe('SmartEdgeForm > AddQosBandwidthModal', () => {
  mockedAddFn.mockReset()
  mockedSubmitDataGen.mockReset()
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeQosProfilesUrls.addEdgeQosProfile.url,
        (req, res, ctx) => {
          mockedAddFn(req.body)
          return res(ctx.json({ response: { id: 't-qos-id' } }))
        }
      )
    )
  })

  it('Add HQoS profile', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      trafficClassSettings: [
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VIDEO',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VOICE',
          priority: 'HIGH',
          priorityScheduling: false
        }
      ],
      name: 'Test-QoS-1',
      description: 'description'
    })
    render(
      <Provider>
        <AddQosBandwidthModal />
      </Provider>, {
        route: { params }
      }
    )

    await click(await screen.findByRole('button', { name: 'Add' }))
    const addModal = await screen.findByRole('dialog')
    await screen.findByText('Add Qos for SmartEdge Profile')
    expect(await screen.findByTestId('rc-QosBandwidthForm')).toBeVisible()

    await click(within(addModal).getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(mockedAddFn).toBeCalledTimes(1))
    await waitFor(() => expect(addModal).not.toBeVisible())
  })

  it('Should close modal while clicking cancel button', async () => {
    render(
      <Provider>
        <AddQosBandwidthModal />
      </Provider>
    )

    await click(await screen.findByRole('button', { name: 'Add' }))
    const addModal = await screen.findByRole('dialog')
    await screen.findByText('Add Qos for SmartEdge Profile')
    const mockForm = await screen.findByTestId('rc-QosBandwidthForm')
    expect(mockForm).toBeVisible()
    const cancelButton = within(mockForm).getByRole('button', { name: 'Cancel' })
    await click(cancelButton)
    await waitFor(() => expect(addModal).not.toBeVisible())
  })
})