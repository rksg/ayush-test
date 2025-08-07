import userEvent from '@testing-library/user-event'
// import { rest }  from 'msw'

import { OltCage, OltFixtures }               from '@acx-ui/olt/utils'
import { Provider }                           from '@acx-ui/store'
import { screen, render, within, mockServer } from '@acx-ui/test-utils'

import { OltCageTable } from './'

const { mockOlt, mockOltCageList } = OltFixtures

jest.mock( './CageDetailsDrawer', () => ({
  // eslint-disable-next-line max-len
  CageDetailsDrawer: (props: { visible: boolean, setVisible: () => void, currentCage?: OltCage }) =>
    props.visible
      ? <div data-testid='CageDetailsDrawer'>{JSON.stringify(props.currentCage)}</div>
      : ''
}))
describe('OltCageTable', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockToggleCageReq = jest.fn()

  beforeEach(() => {
    mockToggleCageReq.mockClear()
    mockServer.use(
    )
  })

  it('should correctly render', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })
    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    expect(row).toBeVisible()

    const downCageRow = screen.getByRole('row', { name: /S1\/1 Down/ })
    // should be unclickable when cage is DOWN
    expect(within(downCageRow).queryByRole('button', { name: 'S1/1' })).toBeNull()
  })

  it('should correctly render loading icon', async () => {
    render(<Provider>
      <OltCageTable
        oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={true}
        isFetching={true}
      />
    </Provider>, { route: { params, path: mockPath } })

    screen.getByRole('img', { name: 'loader' })
  })

  it('should show cage details drawer', async () => {
    render(<Provider>
      <OltCageTable oltDetails={mockOlt}
        oltCages={mockOltCageList as OltCage[]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params, path: mockPath } })

    const row = screen.getByRole('row', { name: /S1\/2 Up/ })
    await userEvent.click(within(row).getByRole('button', { name: 'S1/2' }))
    const drawer = await screen.findByTestId('CageDetailsDrawer')
    expect(drawer).toBeVisible()
  })

})
