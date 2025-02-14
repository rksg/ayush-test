import React from 'react'

import {
  useSwitchDetailHeaderQuery,
  usePortDisableRecoverySettingQuery,
  useUpdatePortDisableRecoverySettingMutation
} from '@acx-ui/rc/services'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ErrorDisableRecoveryDrawer } from './index'

// Mock the hooks
jest.mock('@acx-ui/rc/services', () => ({
  usePortDisableRecoverySettingQuery: jest.fn(),
  useUpdatePortDisableRecoverySettingMutation: jest.fn(),
  useSwitchDetailHeaderQuery: jest.fn()
}))

describe('ErrorDisableRecoveryDrawer', () => {
  const mockSetVisible = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the query hook
    ;(usePortDisableRecoverySettingQuery as jest.Mock).mockReturnValue({
      data: {
        recoveryInterval: 300,
        bpduGuard: true,
        loopDetection: false
      },
      isLoading: false
    })
    // Mock the mutation hook
    ;(useUpdatePortDisableRecoverySettingMutation as jest.Mock).mockReturnValue([jest.fn()])
    // Add this mock for useSwitchDetailHeaderQuery
    ;(useSwitchDetailHeaderQuery as jest.Mock).mockReturnValue({
      data: { /* mock switch detail data */ },
      isLoading: false
    })
  })

  it('renders correctly when visible', async () => {
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>
    )

    await screen.findByText('Error Disable Recovery')
  })
})