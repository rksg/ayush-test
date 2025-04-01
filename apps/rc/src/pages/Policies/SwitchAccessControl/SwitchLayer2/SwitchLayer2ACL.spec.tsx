import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import {  mockServer, render, screen, within } from '@acx-ui/test-utils'

import { SwitchLayer2ACL } from './SwitchLayer2ACL'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchLayer2ACL', () => {
  const params = { tenantId: 'tenant-id' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.post(SwitchUrlsInfo.getLayer2Acls.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            { id: 'acl-1', name: 'ACL 1', description: 'Test ACL 1' },
            { id: 'acl-2', name: 'ACL 2', description: 'Test ACL 2' }
          ],
          total: 2
        }))
      }),
      rest.delete(SwitchUrlsInfo.deleteLayer2Acl.url, (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      })
    )
  })

  it('renders the Layer 2 ACL table with data', async () => {
    render(
      <Provider>
        <SwitchLayer2ACL />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/layer2' }
      }
    )

    expect(await screen.findByText('ACL 1')).toBeInTheDocument()
    expect(screen.getByText('ACL 2')).toBeInTheDocument()
  })

  it('navigates to detail page when clicking on an ACL', async () => {
    render(
      <Provider>
        <SwitchLayer2ACL />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/layer2' }
      }
    )

    const aclLink = await screen.findByText('ACL 1')
    await userEvent.click(aclLink)

    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('deletes an ACL when confirming delete action', async () => {
    render(
      <Provider>
        <SwitchLayer2ACL />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/layer2' }
      }
    )

    await screen.findByText('ACL 1')

    const checkbox = screen.getAllByRole('checkbox')[1]
    await userEvent.click(checkbox)

    const deleteButton = await screen.findByText('Delete')
    await userEvent.click(deleteButton)


    const dialog = await screen.findByRole('dialog')
    const confirmButton = await within(dialog).findByText('Delete')
    await userEvent.click(confirmButton)
  })
})