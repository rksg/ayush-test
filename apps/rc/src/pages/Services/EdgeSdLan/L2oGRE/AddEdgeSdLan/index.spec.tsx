import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { AddEdgeSdLan } from '.'

const mockFormData = {
  name: 'Test SD-LAN',
  tunnelProfileId: 'tunnel-1',
  activatedNetworks: {
    'venue-1': [
      {
        networkId: 'network-1',
        networkName: 'Test Network',
        tunnelProfileId: 'tunnel-1'
      }
    ]
  }
}

const mockCreateEdgeSdLan = jest.fn()
jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  useEdgeSdLanActions: () => ({
    createEdgeSdLan: (params: unknown) => {
      mockCreateEdgeSdLan(params)
      if (params && typeof params === 'object' && 'callback' in params) {
        (params as { callback: (result: unknown) => void }).callback([])
      }
      return Promise.resolve()
    }
  })
}))

jest.mock('../Form', () => ({
  __esModule: true,
  ...jest.requireActual('../Form'),
  EdgeSdLanFormContainer: (props: {
    onFinish: (values: unknown) => Promise<boolean | void>
  }) => {
    return <div data-testid='rc-EdgeSdLanForm'>
      <button onClick={() => {
        props.onFinish(mockFormData)
      }}>Submit</button>
    </div>
  }
}))

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

describe('AddEdgeSdLan', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    render(
      <Provider>
        <AddEdgeSdLan />
      </Provider>, {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/t/services/edgeSdLan/create'
        }
      }
    )

    expect(screen.getByText('Add SD-LAN Service')).toBeVisible()
    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
  })

  it('should navigate to service list after successful submission', async () => {
    render(
      <Provider>
        <AddEdgeSdLan />
      </Provider>, {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/t/services/edgeSdLan/create'
        }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    // Verify the API call
    expect(mockCreateEdgeSdLan).toHaveBeenCalledWith({
      payload: {
        name: mockFormData.name,
        tunnelProfileId: mockFormData.tunnelProfileId,
        activeNetwork: [
          {
            venueId: 'venue-1',
            networkId: 'network-1',
            tunnelProfileId: 'tunnel-1'
          }
        ]
      },
      callback: expect.any(Function)
    })

    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith({
        hash: '',
        pathname: '/t-id/t/services/edgeSdLan/list',
        search: ''
      }, {
        replace: true
      })
    })
  })
})

