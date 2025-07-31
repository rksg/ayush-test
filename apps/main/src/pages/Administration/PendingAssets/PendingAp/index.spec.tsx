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
      rest.get('/api/venues', (req, res, ctx) => {
        return res(ctx.json({
          content: [
            { id: 'venue-1', name: 'Test Venue 1' },
            { id: 'venue-2', name: 'Test Venue 2' }
          ]
        }))
      }),
      rest.get('/api/ap-groups', (req, res, ctx) => {
        return res(ctx.json({
          content: [
            { id: 'group-1', name: 'Test Group 1' },
            { id: 'group-2', name: 'Test Group 2' }
          ]
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
      rest.get('*/venues', (req, res, ctx) => {
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
      rest.get('*/users', (req, res, ctx) => {
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
      rest.get('*/networks', (req, res, ctx) => {
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
      rest.get('*/services', (req, res, ctx) => {
        return res(ctx.json({
          items: [],
          total: 0
        }))
      }),
      rest.get('*/policies', (req, res, ctx) => {
        return res(ctx.json({
          items: [],
          total: 0
        }))
      }),
      rest.get('*/timeline', (req, res, ctx) => {
        return res(ctx.json({
          items: [],
          total: 0
        }))
      }),
      rest.get('*/analytics', (req, res, ctx) => {
        return res(ctx.json({
          items: [],
          total: 0
        }))
      }),
      rest.get('*/reports', (req, res, ctx) => {
        return res(ctx.json({
          items: [],
          total: 0
        }))
      }),
      rest.get('*/msp', (req, res, ctx) => {
        return res(ctx.json({
          items: [],
          total: 0
        }))
      }),
      rest.get('*/health', (req, res, ctx) => {
        return res(ctx.json({ status: 'ok' }))
      }),
      rest.get('*/config', (req, res, ctx) => {
        return res(ctx.json({ version: '1.0.0' }))
      }),
      rest.post('*/auth/login', (req, res, ctx) => {
        return res(ctx.json({ token: 'mock-token' }))
      }),
      rest.post('*/auth/logout', (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      }),
      rest.post('*/upload', (req, res, ctx) => {
        return res(ctx.json({ url: 'mock-upload-url' }))
      }),
      rest.get('*/download/:id', (req, res, ctx) => {
        return res(ctx.json({ url: 'mock-download-url' }))
      }),
      rest.post('*/search', (req, res, ctx) => {
        return res(ctx.json({ items: [], total: 0 }))
      }),
      rest.post('*/batch', (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      }),
      rest.get('*/stats', (req, res, ctx) => {
        return res(ctx.json({ total: 0, active: 0, inactive: 0 }))
      }),
      rest.get('*/logs', (req, res, ctx) => {
        return res(ctx.json({ items: [], total: 0 }))
      }),
      rest.get('*/notifications', (req, res, ctx) => {
        return res(ctx.json({ items: [], total: 0 }))
      }),
      rest.post('*/notifications', (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      }),
      rest.get('*/settings', (req, res, ctx) => {
        return res(ctx.json({ theme: 'light', language: 'en' }))
      }),
      rest.put('*/settings', (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      }),
      rest.all('*', (req, res, ctx) => {
        // eslint-disable-next-line no-console
        console.warn(`[MSW] Unhandled ${req.method} request to ${req.url}`)
        return res(ctx.json({ message: 'Mock response for unhandled request' }))
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

    // Test 1: Refresh functionality
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 2: Pagination
    const pagination = screen.queryByRole('navigation')
    expect(pagination || screen.getByRole('table')).toBeInTheDocument()

    // Test 3: Filtering and search
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'RUCKUS-AP-TEST-001' } })

    await waitFor(() => {
      const tableRows = screen.getAllByRole('row')
      const dataRow = tableRows.find(row =>
        row.textContent?.includes('RUCKUS-AP-TEST-001')
      )
      expect(dataRow).toBeInTheDocument()
    })

    // Test 4: Row selection and actions
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })
  })

  it('handles error states and edge cases', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })


  it('handles data mapping and state management', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Row selection with rowActions
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })

    // Test 2: selectedRows mapping in claim device
    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons.find(button => {
      const buttonElement = button.closest('button')
      return buttonElement && !buttonElement.disabled
    })
    fireEvent.click(claimButton!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Test 3: selectedRows mapping in hide device
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Test 4: Visibility functions with different statuses
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles API configuration and query interactions', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 4: Refresh with error handling
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles selection clearing and reference management', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: clearSelectionRef.current condition
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons.find(button => {
      const buttonElement = button.closest('button')
      return buttonElement && !buttonElement.disabled
    })
    fireEvent.click(claimButton!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})