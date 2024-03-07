import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Tenant, UserProfile, setUserProfile }                   from '@acx-ui/analytics/utils'
import { Provider, rbacApiURL }                                  from '@acx-ui/store'
import { screen, render, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { Support } from '.'

const mockUserProfile = {
  accountId: '1',
  tenants: [{ id: '1', support: false }] as unknown as Tenant[]
}

describe('Support', ()=>{
  beforeEach(()=>setUserProfile(mockUserProfile as UserProfile))

  it('should render properly', async () => {
    render(<Provider><Support /></Provider>)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    expect(await screen.findByText('Enable access to Ruckus Support')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Enable this when requested by RUCKUS support team. By enabling this, you are granting RUCKUS support with temporary administrator-level access.')).toBeVisible()
  })

  it('should update support status', async () => {
    mockServer.use(
      rest.put(`${rbacApiURL}/accounts/1`,
        (_req, res, ctx) => res(ctx.json({ data: 'OK ' })))
    )
    render(<Provider><Support /></Provider>)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(checkbox).toBeChecked()
  })
})