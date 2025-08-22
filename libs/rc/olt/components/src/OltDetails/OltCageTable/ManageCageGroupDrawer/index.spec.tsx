import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { ManageCageGroupDrawer } from './'

describe('ManageCageGroupDrawer', () => {
  const setVisible = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    setVisible.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <ManageCageGroupDrawer
        visible={true}
        setVisible={setVisible}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Manage Cage Group')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

})
