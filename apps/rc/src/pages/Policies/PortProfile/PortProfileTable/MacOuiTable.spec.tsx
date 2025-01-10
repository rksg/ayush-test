import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CountAndNames, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                      from '@acx-ui/store'
import { render, screen, within }        from '@acx-ui/test-utils'
import { mockServer }                    from '@acx-ui/test-utils'

import MacOuiTable from './MacOuiTable'

const mockMacOuiList = {
  data: [
    {
      id: '1',
      oui: '00:1B:44:11:3A:B7',
      note: 'Test Note 1',
      portProfiles: ['profile1']
    },
    {
      id: '2',
      oui: '00:1B:44:11:3A:B8',
      note: 'Test Note 2',
      portProfiles: ['profile2']
    }
  ],
  totalCount: 2
}

const mockPortProfilesList = {
  data: [
    { id: 'profile1', name: 'Profile 1' },
    { id: 'profile2', name: 'Profile 2' }
  ]
}

jest.mock('@acx-ui/rc/components', () => ({
  CountAndNamesTooltip: ({ data }:{ data: CountAndNames }) => <>
    <div data-testid='venue-count'>count:{data.count}</div>
    <div data-testid='venue-names'>names:{data.names.join(',')}</div>
  </>
}))

jest.mock('../PortProfileForm/MacOuiDrawer', () => ({
  MacOuiDrawer: jest.fn(({ visible, setVisible }) =>
    visible ? (
      <div data-testid='mock-mac-oui-drawer'>
        <button onClick={() => setVisible(false)}>Close Drawer</button>
        <div>Edit MAC OUI</div>
      </div>
    ) : null
  )
}))

describe('MacOuiTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchPortProfileMacOuisList.url, (req, res, ctx) => {
        return res(ctx.json(mockMacOuiList))
      }),
      rest.post(SwitchUrlsInfo.getSwitchPortProfilesList.url, (req, res, ctx) => {
        return res(ctx.json(mockPortProfilesList))
      })
    )
  })

  it('should render MacOuiTable with data', async () => {
    render(
      <Provider>
        <MacOuiTable />
      </Provider>
    )

    expect(await screen.findByText('00:1B:44:11:3A:B7')).toBeVisible()
    expect(await screen.findByText('00:1B:44:11:3A:B8')).toBeVisible()
  })

  it('should open edit drawer when Edit button is clicked', async () => {
    render(
      <Provider>
        <MacOuiTable />
      </Provider>
    )

    const row = await screen.findByRole('row', { name: new RegExp(/00:1B:44:11:3A:B7/) })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    expect(await screen.findByTestId('mock-mac-oui-drawer')).toBeInTheDocument()
    expect(await screen.findByText('Edit MAC OUI')).toBeVisible()
  })

  it('should delete selected MAC OUI', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteSwitchPortProfileMacOui.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <MacOuiTable />
      </Provider>
    )

    const row = await screen.findByRole('row', { name: new RegExp(/00:1B:44:11:3A:B7/) })
    await userEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    const dialog = await screen.findByRole('dialog')
    const confirmButton = await within(dialog).findByText('Delete')
    await userEvent.click(confirmButton)
  })
})