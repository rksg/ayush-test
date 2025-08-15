import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'


import { EditCageDrawer } from './'

const { mockOltCageList } = OltFixtures

describe('EditCageDrawer', () => {
  const setVisible = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    setVisible.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <EditCageDrawer
        data={mockOltCageList[0]}
        visible={true}
        setVisible={setVisible}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Edit Cage')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

})
