import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { ManageOntsDrawer } from './'

jest.mock('./EditOntDrawer', () => ({
  EditOntDrawer: () => <div data-testid='EditOntDrawer' />
}))

describe('ManageOntsDrawer', () => {
  const mockOpenEditOnt = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    mockOpenEditOnt.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <ManageOntsDrawer
        visible={true}
        onClose={jest.fn()}
        onOpenEditOnt={mockOpenEditOnt}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Manage ONTs')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Edit ONT'))
    expect(mockOpenEditOnt).toHaveBeenCalled()
  })

})
