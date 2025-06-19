import React from 'react'

import { Provider }                           from '@acx-ui/store'
import { render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'

import { PendingSwitch } from '.'

describe('PendingSwitch component', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  const path = '/:tenantId/administration/PendingAssets'

  it('renders table with correct columns and data', () => {
    render(
      <Provider>
        <PendingSwitch />
      </Provider>, {
        route: { params, path }
      })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    const columns = table.querySelectorAll('th')
    expect(columns.length).toBe(7)
    const dataRows = table.querySelectorAll('tbody tr')
    expect(dataRows.length).toBe(6)
  })

  it('updates refreshAt state when refresh button is clicked', async () => {
    render(
      <Provider>
        <PendingSwitch />
      </Provider>, {
        route: { params, path }
      })
    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeInTheDocument()
    const initialRefreshAt = screen.getByTestId('test-refresh-time').textContent
    fireEvent.click(refreshButton)
    await waitFor(() => {
      const newRefreshAt = screen.getByTestId('test-refresh-time').textContent
      expect(newRefreshAt).not.toBe(initialRefreshAt)
    })
  })

})