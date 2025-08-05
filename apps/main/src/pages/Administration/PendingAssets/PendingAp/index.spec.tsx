import React from 'react'

import moment   from 'moment'
import { rest } from 'msw'

import { DeviceProvisionUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'

import { PendingAp } from '.'

moment.suppressDeprecationWarnings = true

const mockCommonResult = {
  success: true,
  message: 'Operation completed successfully'
}

describe('PendingAp', () => {
  const params = { tenantId: 'test-tenant' }
  const path = '/administration/pendingAssets/pendingAp'

  beforeEach(() => {
    mockServer.use(
      rest.post(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            },
            {
              serialNumber: 'RUCKUS-AP-TEST-002',
              model: 'R760',
              shipDate: '2024-01-16T00:00:00.000Z',
              createdDate: '2024-01-21T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 2
          },
          totalElements: 2,
          totalPages: 1
        }))
      }),
      rest.post(DeviceProvisionUrlsInfo.importApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.get('*/deviceProvisions/statusReports/aps', (req, res, ctx) => {
        return res(ctx.json({
          refreshedAt: null
        }))
      }),
      rest.patch('*/deviceProvisions/statusReports/aps', (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      }),
      rest.get('*/deviceProvisions/aps/models', (req, res, ctx) => {
        return res(ctx.json([
          'R510',
          'R610',
          'R710',
          'R750',
          'R760',
          'R770'
        ]))
      }),
      rest.post('*/venues/query', (req, res, ctx) => {
        return res(ctx.json({
          content: [],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0
          },
          totalElements: 0,
          totalPages: 0
        }))
      }),
      rest.post('*/venues/apGroups/query', (req, res, ctx) => {
        return res(ctx.json({
          content: [],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0
          },
          totalElements: 0,
          totalPages: 0
        }))
      })
    )
  })

  it('renders table with correct columns and data', async () => {
    render(
      <Provider>
        <PendingAp />
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
        <PendingAp />
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
        <PendingAp />
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
    expect(screen.getByText('RUCKUS-AP-TEST-001')).toBeInTheDocument()
    expect(screen.getByText('RUCKUS-AP-TEST-002')).toBeInTheDocument()
    expect(screen.getByText('R770')).toBeInTheDocument()
    expect(screen.getByText('R760')).toBeInTheDocument()
  })
})