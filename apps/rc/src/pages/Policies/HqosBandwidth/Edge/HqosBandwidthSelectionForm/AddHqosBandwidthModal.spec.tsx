import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeHqosProfilesUrls }                        from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { HqosBandwidthFormModel } from '../HqosBandwidthForm'

import { AddHqosBandwidthModal } from './AddHqosBandwidthModal'
const { click } = userEvent
const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../HqosBandwidthForm', () => ({
  __esModule: true,
  ...jest.requireActual('../HqosBandwidthForm'),
  default: (props: {
    onFinish: (values: HqosBandwidthFormModel) => Promise<boolean | void>
    onCancel: () => void
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-HqosBandwidthForm'>
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

describe('SmartEdgeForm > AddHqosBandwidthModal', () => {
  mockedAddFn.mockReset()
  mockedSubmitDataGen.mockReset()
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.addEdgeHqosProfile.url,
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
        <AddHqosBandwidthModal />
      </Provider>, {
        route: { params }
      }
    )

    await click(await screen.findByRole('button', { name: 'Add' }))
    const addModal = await screen.findByRole('dialog')
    await screen.findByText('Add HQos for RUCKUS Edge Profile')
    expect(await screen.findByTestId('rc-HqosBandwidthForm')).toBeVisible()

    await click(within(addModal).getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(mockedAddFn).toBeCalledTimes(1))
    await waitFor(() => expect(addModal).not.toBeVisible())
  })

  it('Should close modal while clicking cancel button', async () => {
    render(
      <Provider>
        <AddHqosBandwidthModal />
      </Provider>
    )

    await click(await screen.findByRole('button', { name: 'Add' }))
    const addModal = await screen.findByRole('dialog')
    await screen.findByText('Add HQos for RUCKUS Edge Profile')
    const mockForm = await screen.findByTestId('rc-HqosBandwidthForm')
    expect(mockForm).toBeVisible()
    const cancelButton = within(mockForm).getByRole('button', { name: 'Cancel' })
    await click(cancelButton)
    await waitFor(() => expect(addModal).not.toBeVisible())
  })
})
