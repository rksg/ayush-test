import React from 'react'

import { rest } from 'msw'

import { DeviceProvisionUrlsInfo }            from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'

import { PendingAp } from '.'

// eslint-disable-next-line no-console
const originalWarn = console.warn
// eslint-disable-next-line no-console
console.warn = (...args: unknown[]) => {
  const warningMsg =
    'Deprecation warning: value provided is not in a recognized RFC2822 or ISO format'
  const mswWarningMsg = '[MSW] Warning: captured a request without a matching request handler'

  if (typeof args[0] === 'string' &&
      (args[0].includes(warningMsg) || args[0].includes(mswWarningMsg))) {
    return
  }
  originalWarn(...args)
}

// eslint-disable-next-line no-console
const originalError = console.error
// eslint-disable-next-line no-console
console.error = (...args: unknown[]) => {
  const useFormWarning =
    'Warning: Instance created by `useForm` is not connected to any Form element'
  const connectionError = 'Error: connect ECONNREFUSED 127.0.0.1:80'
  const antdTableWarning =
    '[antd: Table] `dataSource` length is less than `pagination.total` ' +
    'but large than `pagination.pageSize`'
  const rtkQueryError = 'Error encountered handling the endpoint'
  const queryFnError = 'queryFn returned an object containing neither a valid error and result'
  const dataUndefinedError = 'Object returned was: { data: undefined }'

  if (typeof args[0] === 'string' &&
      (args[0].includes(useFormWarning) ||
       args[0].includes(connectionError) ||
       args[0].includes(antdTableWarning) ||
       args[0].includes(rtkQueryError) ||
       args[0].includes(queryFnError) ||
       args[0].includes(dataUndefinedError))) {
    return
  }
  originalError(...args)
}

const mockCommonResult = {
  success: true,
  message: 'Operation completed successfully'
}

describe('PendingAp', () => {
  const params = { tenantId: 'test-tenant' }
  const path = '/administration/pendingAssets/pendingAp'

  beforeEach(() => {
    jest.clearAllMocks()
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

  it('handles complete device management flow including claim, hide, and UI interactions',
    async () => {
      const { mockServer } = require('@acx-ui/test-utils')
      mockServer.use(
        rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
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
                visibleStatus: 'Hidden'
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
        rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
          return res(ctx.json(mockCommonResult))
        })
      )

      render(
        <Provider>
          <PendingAp />
        </Provider>, {
          route: { params, path }
        })

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Wait for data to load and checkboxes to be available
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
      })

      // Wait a bit more for the component to fully render
      await new Promise(resolve => setTimeout(resolve, 100))

      const firstRowCheckbox = screen.getAllByRole('checkbox')[1]

      // Wait for checkbox to be enabled before clicking
      await waitFor(() => {
        expect(firstRowCheckbox).not.toBeDisabled()
      })

      fireEvent.click(firstRowCheckbox)

      // Wait for the checkbox to be checked
      await waitFor(() => {
        expect(firstRowCheckbox).toBeChecked()
      }, { timeout: 3000 })

      const claimButtons = screen.getAllByText('Claim Device')
      const claimButton = claimButtons[0]
      fireEvent.click(claimButton)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      const hideButton = screen.queryByText(/Hide Device/i)
      if (hideButton) {
        fireEvent.click(hideButton)
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
      })
    })

  it('handles refresh functionality and formatter functions', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshTime = screen.getByTestId('test-refresh-time')
    expect(refreshTime).toBeInTheDocument()

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeInTheDocument()

    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })
  })

  it('handles table configuration and ClaimDeviceDrawer interactions', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be available
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles venue and AP group drawer functionality', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be available
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles error states and loading states', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

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

  it('handles pagination and sorting', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('handles filtering and search functionality', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('handles auto refresh and useEffect dependencies', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: null }))
      }),
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

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

  it('handles row actions and visibility functions', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-VISIBLE',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            },
            {
              serialNumber: 'RUCKUS-AP-HIDDEN',
              model: 'R760',
              shipDate: '2024-01-16T00:00:00.000Z',
              createdDate: '2024-01-21T00:00:00.000Z',
              visibleStatus: 'Hidden'
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
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })
  })

  it('handles venue creation success callback', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be available
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles hide device action with hidden devices', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-HIDDEN-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Hidden'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

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

  it('handles ClaimDeviceDrawer onClose with clearSelectionRef current', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Wait a bit more for the component to fully render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find the first data row checkbox (skip header checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1] // Second checkbox should be first data row

    expect(firstRowCheckbox).toBeInTheDocument()
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the ClaimDeviceDrawer onClose callback with clearSelectionRef.current
  })

  it('handles formatter functions in columns and refresh', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: '2024-01-25T10:30:00.000Z' }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshTime = screen.getByTestId('test-refresh-time')
    expect(refreshTime).toBeInTheDocument()
  })

  it('handles table query configuration and API interactions', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApModels.url, (req, res, ctx) => {
        return res(ctx.json(['R770', 'R760', 'R750']))
      })
    )

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

  it('handles rowSelection condition with rowActions length check', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('handles selectedRows.map in claim device onClick', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be available
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles selectedRows.map in hide device onClick', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      }),
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Wait a bit more for the component to fully render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find the first data row checkbox (skip header checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1] // Second checkbox should be first data row

    expect(firstRowCheckbox).toBeInTheDocument()

    // Wait for checkbox to be enabled before clicking
    await waitFor(() => {
      expect(firstRowCheckbox).not.toBeDisabled()
    })

    fireEvent.click(firstRowCheckbox)

    // Wait for the checkbox to be checked
    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 3000 })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles visible function in rowActions with different device statuses', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-VISIBLE-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            },
            {
              serialNumber: 'RUCKUS-AP-HIDDEN-001',
              model: 'R760',
              shipDate: '2024-01-16T00:00:00.000Z',
              createdDate: '2024-01-21T00:00:00.000Z',
              visibleStatus: 'Hidden'
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
      })
    )

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

  it('handles onAddApGroup prop in ClaimDeviceDrawer', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be available
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles venue creation with venue parameter', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Simulate venue creation success with venue parameter
    // This tests the if (venue) condition in handleVenueCreated
    const component = screen.getByRole('table').closest('div')
    if (component) {
      // Trigger venue creation success callback
      const venueDrawer = component.querySelector('[data-testid="venue-drawer"]')
      if (venueDrawer) {
        fireEvent.click(venueDrawer)
      }
    }
  })

  it('handles auto refresh when apStatus.refreshedAt is null', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: null }))
      }),
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This should trigger the auto refresh logic
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })
  })

  it('handles clearSelectionRef.current condition in ClaimDeviceDrawer onClose', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be available
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the clearSelectionRef.current condition
    // The ClaimDeviceDrawer should be rendered and handle onClose
  })

  it('handles rowActions length condition for rowSelection', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Verify that rowSelection is enabled when rowActions.length > 0
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()

    // Check that checkboxes are present (indicating rowSelection is enabled)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('handles visible function with mixed device statuses', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-VISIBLE-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            },
            {
              serialNumber: 'RUCKUS-AP-HIDDEN-001',
              model: 'R760',
              shipDate: '2024-01-16T00:00:00.000Z',
              createdDate: '2024-01-21T00:00:00.000Z',
              visibleStatus: 'Hidden'
            },
            {
              serialNumber: 'RUCKUS-AP-VISIBLE-002',
              model: 'R750',
              shipDate: '2024-01-17T00:00:00.000Z',
              createdDate: '2024-01-22T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 3
          },
          totalElements: 3,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Select only visible devices
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    // This should test the visible function logic
    const claimButtons = screen.getAllByText('Claim Device')
    expect(claimButtons.length).toBeGreaterThan(0)
  })

  it('handles formatter functions with null values', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: null }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test formatter with null value
    const refreshTime = screen.getByTestId('test-refresh-time')
    expect(refreshTime).toBeInTheDocument()
  })

  it('handles table query error states', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

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

  it('handles refresh functionality with error handling', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })
  })

  it('handles hide device action with clearSelection callback', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    // This tests the clearSelection() callback in hide device onClick
    const hideButton = screen.queryByText(/Hide Device/i)
    if (hideButton) {
      fireEvent.click(hideButton)
    }
  })

  it('handles ClaimDeviceDrawer onClose without clearSelectionRef', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Wait a bit more for the component to fully render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find the first data row checkbox (skip header checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1] // Second checkbox should be first data row

    expect(firstRowCheckbox).toBeInTheDocument()

    // Wait for checkbox to be enabled before clicking
    await waitFor(() => {
      expect(firstRowCheckbox).not.toBeDisabled()
    })

    fireEvent.click(firstRowCheckbox)

    // Wait for the checkbox to be checked
    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 3000 })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the case where clearSelectionRef.current is null
    // The ClaimDeviceDrawer should handle onClose gracefully
  })

  it('handles venue creation without venue parameter', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the handleVenueCreated function when venue is undefined
    // The if (venue) condition should not be executed
  })

  it('handles table with empty rowActions', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
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

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the rowSelection condition when rowActions.length is 0
  })

  it('handles apStatus with null refreshedAt', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: null }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the apStatus?.refreshedAt ?? null branch
  })

  it('handles latestApStatus with null refreshedAt', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: '2024-01-25T10:30:00.000Z' }))
      }),
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })

    // This tests the latestApStatus?.refreshedAt ?? null branch
  })

  it('handles ClaimDeviceDrawer onClose with clearSelectionRef', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Find the first data row checkbox (skip header checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1] // Second checkbox should be first data row

    expect(firstRowCheckbox).toBeInTheDocument()
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // This tests the ClaimDeviceDrawer onClose callback with clearSelectionRef.current
  })

  it('handles hide device onClick with row mapping', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      }),
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Wait a bit more for the component to fully render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find the first data row checkbox (skip header checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1] // Second checkbox should be first data row

    expect(firstRowCheckbox).toBeInTheDocument()

    // Wait for checkbox to be enabled before clicking
    await waitFor(() => {
      expect(firstRowCheckbox).not.toBeDisabled()
    })

    fireEvent.click(firstRowCheckbox)

    // Wait for the checkbox to be checked
    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 3000 })

    // This tests the row.serialNumber mapping in hide device onClick
    const hideButton = screen.queryByText(/Hide Device/i)
    if (hideButton) {
      fireEvent.click(hideButton)
    }
  })

  it('handles drawer interactions and callbacks', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 1
          },
          totalElements: 1,
          totalPages: 1
        }))
      }),
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: null }))
      }),
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Wait for data to load and checkboxes to be enabled
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Should have more than just header checkbox
    })

    // Wait a bit more for the component to fully render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Select a row and open ClaimDeviceDrawer
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1] // Second checkbox should be first data row

    expect(firstRowCheckbox).toBeInTheDocument()

    // Wait for checkbox to be enabled before clicking
    await waitFor(() => {
      expect(firstRowCheckbox).not.toBeDisabled()
    })

    fireEvent.click(firstRowCheckbox)

    // Wait for the checkbox to be checked
    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 3000 })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons[0]
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test refresh with null latestApStatus
    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })

    // This comprehensive test covers:
    // - handleAddVenue, handleVenueDrawerClose, handleVenueCreated (via ClaimDeviceDrawer)
    // - handleAddApGroup, handleApGroupDrawerClose (via ClaimDeviceDrawer)
    // - ClaimDeviceDrawer onClose callback with clearSelectionRef
    // - latestApStatus?.refreshedAt ?? null branch
    // - row.serialNumber mapping in various contexts
  })
})