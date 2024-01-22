import '@testing-library/react'
import { Provider }                          from '@acx-ui/store'
import { findTBody, render, screen, within } from '@acx-ui/test-utils'
import { noDataDisplay }                     from '@acx-ui/utils'

import { mockMangedUsers } from './__tests__/fixtures'
import { UsersTable }      from './Table'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn().mockImplementation(() => ({
    selectedTenant: { settings: { franchisor: 'testFranchisor' } }
  }))
}))

describe('UsersTable', () => {
  it('should render table correctly', async () => {
    render(<UsersTable data={mockMangedUsers} />, { wrapper: Provider })
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(4)
    expect(await screen.findByText('firstName dog1')).toBeVisible()
    expect(await screen.findByText('FisrtName 1062')).toBeVisible()
    expect(await screen.findByText('FisrtName 12')).toBeVisible()
    expect(await screen.findByText('FisrtName rej')).toBeVisible()
    expect(await screen.findAllByText(noDataDisplay)).toHaveLength(2)
    expect(await screen.findByText('Pending')).toBeVisible()
    expect(await screen.findByText('Accepted')).toBeVisible()
    expect(await screen.findByText('Rejected')).toBeVisible()
    expect(await screen.findByText('userFirst userSecond')).toBeVisible()
    expect(await screen.findByText('userThird userFourth')).toBeVisible()
    expect(await screen.findByText('userRej userRej')).toBeVisible()
  })
  it('should render undefined data table correctly', async () => {
    render(<UsersTable data={undefined} />, { wrapper: Provider })
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })
})
