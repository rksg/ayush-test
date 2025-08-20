import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { EditOntPortDrawer } from './'

describe('EditOntPortDrawer', () => {
  const setVisible = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    setVisible.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <EditOntPortDrawer
        visible={true}
        setVisible={setVisible}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('EditOntPortDrawer')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Cancel'))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

})
