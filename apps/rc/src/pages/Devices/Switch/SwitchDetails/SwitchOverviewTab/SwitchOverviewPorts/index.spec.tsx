import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi }                                             from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { portlistData } from '../../../../__tests__/fixtures'

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
