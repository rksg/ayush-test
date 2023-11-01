import userEvent from '@testing-library/user-event'

import { Provider, store, r1VideoCallQoeURL } from '@acx-ui/store'
import { screen, render, mockGraphqlQuery }   from '@acx-ui/test-utils'

import { getAllCallQoeTests, getAllCallQoeTestsWithNotStarted } from './__tests__/fixtures'
import { api }                                                  from './services'

import { useVideoCallQoe, VideoCallQoe } from '.'

describe('VideoCallQoe', () => {
  const params = { tenantId: 'tenant-id' }

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(r1VideoCallQoeURL,'CallQoeTests', { data: getAllCallQoeTests })
  })

  describe('useVideoCallQoe', () => {
    it('should render page correctly', async () => {
      const Component = () => {
        const { component } = useVideoCallQoe()
        return component
      }
      render(<Component/>, { wrapper: Provider, route: { params } })
      expect(await screen.findByText('Test Call Name')).toBeVisible()
    })

    it('should render title with count correctly', async () => {
      const Component = () => {
        const { title } = useVideoCallQoe()
        return <span>{title}</span>
      }
      render(<Component/>, { wrapper: Provider, route: {} })
      expect(await screen.findByText('Video Call QoE (3)')).toBeVisible()
    })
    it('should render extra header correctly', async () => {
      const Component = () => {
        const { headerExtra } = useVideoCallQoe()
        return <span>{headerExtra}</span>
      }
      render(<Component/>, { wrapper: Provider, route: {} })
      expect(await screen.findByText('Create Test Call')).toBeVisible()
    })

    it('should disable the create test call button', async () => {
      mockGraphqlQuery(r1VideoCallQoeURL,'CallQoeTests', { data: getAllCallQoeTestsWithNotStarted })
      const Component = () => {
        const { headerExtra } = useVideoCallQoe()
        return <span>{headerExtra}</span>
      }
      render(<Component/>, { wrapper: Provider, route: { params } })
      expect(await screen.findByRole('button', { name: /create test call/i })).toBeDisabled()
    })

    it('should update tab count by context', async () => {
      const Component = () => {
        const { title, component } = useVideoCallQoe()
        return <>{title}{component}</>
      }
      render(<Component/>, { wrapper: Provider, route: {} })
      expect(await screen.findByText('Video Call QoE (3)')).toBeVisible()
      const input = await screen.findByPlaceholderText('Search Test Call Name')
      await userEvent.type(input, 'anything')
      expect(await screen.findByText('Video Call QoE (0)')).toBeVisible()
    })
  })

  describe('VideoCallQoe page', () => {
    it('should render page correctly', async () => {
      render(<VideoCallQoe />, { wrapper: Provider, route: { params } })
      expect(await screen.findByText('Video Call QoE (3)')).toBeVisible()
      expect(await screen.findByText('Create Test Call')).toBeVisible()
      expect(await screen.findByText('Test Call Name')).toBeVisible()
    })
  })
})

