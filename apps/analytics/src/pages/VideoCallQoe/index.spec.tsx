import { useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { Provider, store, videoCallQoeURL }                            from '@acx-ui/store'
import { screen, render, mockGraphqlQuery, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { getAllCallQoeTests, getAllCallQoeTestsWithNotStarted } from './__tests__/fixtures'
import { api }                                                  from './services'

import VideoCallQoeListPage from '.'

describe('VideoCallQoeListPage', () => {
  const params = {
    tenantId: 'tenant-id'
  }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render page header', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTests
    })
    render(<Provider>
      <VideoCallQoeListPage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
    // eslint-disable-next-line testing-library/no-debugging-utils
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    expect(await screen.findByRole('button', {
      name: /create test call/i
    })).toBeEnabled()
  })

  it('should disable the create test call button', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTestsWithNotStarted
    })
    render(<Provider>
      <VideoCallQoeListPage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
    // eslint-disable-next-line testing-library/no-debugging-utils
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])
    expect(await screen.findByRole('button', {
      name: /create test call/i
    })).toBeDisabled()
  })

  it('should not render page if feature flag is off', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTests
    })
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider>
      <VideoCallQoeListPage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE is not enabled')).toBeInTheDocument()
  })
})
