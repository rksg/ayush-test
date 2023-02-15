import '@testing-library/jest-dom'
import { Provider  }       from '@acx-ui/store'
import {  render, screen } from '@acx-ui/test-utils'


import { SwitchOverviewPorts } from '.'

const params = {
  tenantId: 'tenant-id'
}

jest.mock('@acx-ui/rc/components', () => ({
  SwitchPortTable: () => <div data-testid={'SwitchPortTable'} />
}))

describe('SwitchOverviewPorts', () => {

  it('should render correctly', async () => {
    render(<Provider>
      <SwitchOverviewPorts />
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })
    expect(screen.getByTestId('SwitchPortTable')).toBeVisible()
  })
})
