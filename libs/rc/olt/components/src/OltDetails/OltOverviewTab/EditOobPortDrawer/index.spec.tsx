import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { EditOobPortDrawer } from '.'

const { mockOltPortList } = OltFixtures

describe('EditPortDrawer', () => {
  const setVisible = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    setVisible.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <EditOobPortDrawer
        data={mockOltPortList[0]}
        visible={true}
        setVisible={setVisible}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Edit OOB')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

})
