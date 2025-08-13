import userEvent from '@testing-library/user-event'

import { OltPort, OltFixtures }               from '@acx-ui/olt/utils'
import { Provider }                           from '@acx-ui/store'
import { screen, render, within, mockServer } from '@acx-ui/test-utils'

import { OltPortTable } from '.'

const { mockOlt, mockOltPortList } = OltFixtures

jest.mock('../EditPortDrawer', () => ({
  EditPortDrawer: () => <div data-testid='EditPortDrawer' />
}))

// jest.mock('../ManageOntsSnDrawer', () => ({
//   ManageOntsSnDrawer: () => <div data-testid='ManageOntsSnDrawer' />
// }))

// jest.mock('../ManageCageGroupDrawer', () => ({
//   ManageCageGroupDrawer: () => <div data-testid='ManageCageGroupDrawer' />
// }))

describe('OltPortTable', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockToggleCageReq = jest.fn()

  beforeEach(() => {
    mockToggleCageReq.mockClear()
    mockServer.use(
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <OltPortTable
        oltDetails={mockOlt}
        oltPorts={mockOltPortList as OltPort[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })
    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    expect(row).toBeVisible()

    const downCageRow = screen.getByRole('row', { name: /S1\/1 Down/ })
    expect(within(downCageRow).queryByRole('button', { name: 'S1/1' })).toBeNull()
  })

  it('should render loading icon correctly', async () => {
    render(<Provider>
      <OltPortTable
        oltDetails={mockOlt}
        oltPorts={mockOltPortList as OltPort[]}
        isLoading={true}
        isFetching={true}
      />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByRole('img', { name: 'loader' })
  })

  it('should handle tab change correctly', async () => {
    render(<Provider>
      <OltPortTable
        oltDetails={mockOlt}
        oltPorts={mockOltPortList as OltPort[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const tab = screen.getByRole('tab', { name: 'OOB' })
    expect(tab).toBeInTheDocument()
    await userEvent.click(tab)
    expect(screen.queryByRole('row', { name: /S1\/2 Up/ })).toBeNull()
  })

  it('should open edit port drawer correctly', async () => {
    render(<Provider>
      <OltPortTable
        oltDetails={mockOlt}
        oltPorts={mockOltPortList as OltPort[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    await userEvent.click(row)
    const editCageButton = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(editCageButton)
    expect(screen.getByTestId('EditPortDrawer')).toBeInTheDocument()
  })

  // it('should open manage onts sn drawer correctly', async () => {
  //   render(<Provider>
  //     <OltPortTable
  //       oltDetails={mockOlt}
  //       oltPorts={mockOltPortList as OltPort[]}
  //       isLoading={false}
  //       isFetching={false}
  //     />
  //   </Provider>, { route: { params, path: mockPath } })

  //   expect(screen.getByRole('row', { name: /S1\/2 Up/ })).toBeVisible()
  //   const manageOntsSnButton = screen.getByRole('button', { name: 'Manage ONT S/N' })
  //   await userEvent.click(manageOntsSnButton)
  //   expect(screen.getByTestId('ManageOntsSnDrawer')).toBeInTheDocument()
  // })

  // it('should open manage cage group drawer correctly', async () => {
  //   render(<Provider>
  //     <OltPortTable
  //       oltDetails={mockOlt}
  //       oltPorts={mockOltPortList as OltPort[]}
  //       isLoading={false}
  //       isFetching={false}
  //     />
  //   </Provider>, { route: { params, path: mockPath } })

  //   expect(screen.getByRole('row', { name: /S1\/2 Up/ })).toBeVisible()
  //   const manageCageGroupButton = screen.getByRole('button', { name: 'Manage Cage Group' })
  //   await userEvent.click(manageCageGroupButton)
  //   expect(screen.getByTestId('ManageCageGroupDrawer')).toBeInTheDocument()
  // })

})
