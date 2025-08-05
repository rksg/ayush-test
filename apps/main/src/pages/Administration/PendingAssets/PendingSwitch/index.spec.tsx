// Suppress moment deprecation warnings
import React from 'react'

import moment   from 'moment'
import { rest } from 'msw'

import { DeviceProvisionUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'

import { PendingSwitch } from '.'

moment.suppressDeprecationWarnings = true

const mockCommonResult = {
  success: true,
  message: 'Operation completed successfully'
}

describe('PendingSwitch', () => {
  const params = { tenantId: 'test-tenant' }
  const path = '/administration/pendingAssets/pendingSwitch'

  beforeEach(() => {
    mockServer.use(
      rest.post(DeviceProvisionUrlsInfo.getSwitchProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-SW-TEST-001',
              model: 'ICX7150',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            },
            {
              serialNumber: 'RUCKUS-SW-TEST-002',
              model: 'ICX7250',
              shipDate: '2024-01-16T00:00:00.000Z',
              createdDate: '2024-01-21T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          totalElements: 2
        }))
      }),
      rest.post(DeviceProvisionUrlsInfo.importSwitchProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.patch(DeviceProvisionUrlsInfo.hideSwitchProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.get('*/deviceProvisions/statusReports/switches', (req, res, ctx) => {
        return res(ctx.json({
          refreshedAt: null
        }))
      }),
      rest.patch('*/deviceProvisions/statusReports/switches', (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      }),
      rest.get('*/deviceProvisions/switches/models', (req, res, ctx) => {
        return res(ctx.json([
          'ICX7150',
          'ICX7250',
          'ICX7450',
          'ICX7650'
        ]))
      }),
      rest.post('*/venues/query', (req, res, ctx) => {
        return res(ctx.json({
          content: [],
          totalElements: 0
        }))
      }),
      rest.post('*/venues/apGroups/query', (req, res, ctx) => {
        return res(ctx.json({
          content: [],
          totalElements: 0
        }))
      })
    )
  })

  it('renders table with correct columns and data', async () => {
    render(
      <Provider>
        <PendingSwitch />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    expect(screen.getByText('Serial #')).toBeInTheDocument()
    expect(screen.getAllByText('Model')[0]).toBeInTheDocument()
    expect(screen.getByText('Ship Date')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('handles comprehensive device management scenarios', async () => {
    render(
      <Provider>
        <PendingSwitch />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Checkbox selection and row actions
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    await waitFor(() => {
      expect(firstRowCheckbox).not.toBeDisabled()
    })

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })

    // Test 2: Claim device functionality
    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons.find(button => {
      const buttonElement = button.closest('button')
      return buttonElement && !buttonElement.disabled
    })
    expect(claimButton).toBeDefined()

    fireEvent.click(claimButton!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Test 3: ClaimDeviceDrawer interactions and close
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Test 4: Table functionality verification
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles table functionality and interactions', async () => {
    render(
      <Provider>
        <PendingSwitch />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test table interactions
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()

    // Test that we can see the device data
    expect(screen.getByText('RUCKUS-SW-TEST-001')).toBeInTheDocument()
    expect(screen.getByText('RUCKUS-SW-TEST-002')).toBeInTheDocument()
    expect(screen.getByText('ICX7150')).toBeInTheDocument()
    expect(screen.getByText('ICX7250')).toBeInTheDocument()
  })
})