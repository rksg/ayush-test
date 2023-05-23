import { useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { Provider, store, videoCallQoeURL }                            from '@acx-ui/store'
import { screen, render, mockGraphqlQuery, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { getAllCallQoeTests, getAllCallQoeTestsWithNotStarted } from './__tests__/fixtures'
import { api }                                                  from './services'

import { useVideoCallQoe } from '.'

jest.mock('./VideoCallQoeTable', () => ({
  ...jest.requireActual('./VideoCallQoeTable'),
  VideoCallQoeTable: () => <div data-testid='VideoCallQoeTable' />
}))

describe('VideoCallQoeListPage', () => {
  const params = { tenantId: 'tenant-id' }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(api.util.resetApiState())
  })

  it('should render page correctly', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTests
    })
    const Component = () => {
      const { component } = useVideoCallQoe()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: { params } })
    expect(await screen.findByTestId('VideoCallQoeTable')).toBeVisible()
  })

  it('should disable the create test call button', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTestsWithNotStarted
    })
    const Component = () => {
      const { headerExtra } = useVideoCallQoe()
      return <span>{headerExtra}</span>
    }
    render(<Component/>, { wrapper: Provider, route: { params } })
    expect(await screen.findByRole('button', { name: /create test call/i })).toBeDisabled()
  })

  it.todo('should not render page if feature flag VIDEO_CALL_QOE is off', async () => {
  })

  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTests
    })
    const Component = () => {
      const { component } = useVideoCallQoe()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
    expect(await screen.findByTestId('VideoCallQoeTable')).toBeVisible()
    expect(await screen.findByRole('button', { name: /create test call/i })).toBeEnabled()
  })
})
