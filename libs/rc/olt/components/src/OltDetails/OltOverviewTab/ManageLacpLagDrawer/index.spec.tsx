import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { ManageLacpLagDrawer } from '.'

describe('ManageLacpLagDrawer', () => {
  const setVisible = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    setVisible.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <ManageLacpLagDrawer
        visible={true}
        setVisible={setVisible}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Manage LACP LAG')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

})
