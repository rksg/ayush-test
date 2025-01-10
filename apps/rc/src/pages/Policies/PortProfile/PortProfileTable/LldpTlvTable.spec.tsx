import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CountAndNames, SwitchUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { render, screen, within, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { mockServer }                                        from '@acx-ui/test-utils'

import LldpTlvTable from './LldpTlvTable'

const mockLldpTlvList = {
  data: [
    {
      id: '1',
      systemName: 'Switch1',
      nameMatchingType: 'EXACT',
      systemDescription: 'Description1',
      descMatchingType: 'CONTAINS',
      portProfiles: ['profile1']
    },
    {
      id: '2',
      systemName: 'Switch2',
      nameMatchingType: 'CONTAINS',
      systemDescription: 'Description2',
      descMatchingType: 'EXACT',
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

jest.mock('../PortProfileForm/LldpTlvDrawer', () => ({
  LldpTlvDrawer: jest.fn(({ visible, setVisible }) =>
    visible ? (
      <div data-testid='mock-lldp-tlv-drawer'>
        <button onClick={() => setVisible(false)}>Close Drawer</button>
        <div>Edit LLDP TLV</div>
      </div>
    ) : null
  )
}))

describe('LldpTlvTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchPortProfileLldpTlvsList.url, (req, res, ctx) => {
        return res(ctx.json(mockLldpTlvList))
      }),
      rest.post(SwitchUrlsInfo.getSwitchPortProfilesList.url, (req, res, ctx) => {
        return res(ctx.json(mockPortProfilesList))
      })
    )
  })

  it('should render LldpTlvTable with data', async () => {
    render(
      <Provider>
        <LldpTlvTable />
      </Provider>
    )

    expect(await screen.findByText('Switch1')).toBeVisible()
    expect(await screen.findByText('Switch2')).toBeVisible()
  })

  it('should open edit drawer when Edit button is clicked', async () => {
    render(
      <Provider>
        <LldpTlvTable />
      </Provider>
    )

    const row = await screen.findByRole('row', { name: /Switch1/ })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    expect(await screen.findByTestId('mock-lldp-tlv-drawer')).toBeInTheDocument()
    expect(await screen.findByText('Edit LLDP TLV')).toBeVisible()
  })

  it('should delete selected LLDP TLV', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteSwitchPortProfileLldpTlv.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <LldpTlvTable />
      </Provider>
    )

    const row = await screen.findByRole('row', { name: /Switch1/ })
    await userEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    const dialog = await screen.findByRole('dialog')
    const confirmButton = await within(dialog).findByText('Delete')
    await userEvent.click(confirmButton)

    expect(deleteFn).toHaveBeenCalled()
  })

  it('should render correct column headers', async () => {
    render(
      <Provider>
        <LldpTlvTable />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByText('System Name')).toBeVisible()
    expect(screen.getByText('Name Match')).toBeVisible()
    expect(screen.getByText('System Description')).toBeVisible()
    expect(screen.getByText('Description Match')).toBeVisible()
    expect(screen.getByText('Profile Name')).toBeVisible()
  })
})