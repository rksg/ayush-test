
import { Hotspot20ConnectionCapability } from '@acx-ui/rc/utils'
import { Provider }                      from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ConnectionCapabilityDrawer from './ConnectionCapabilityDrawer'

describe('Connection Capability Drawer', () => {
  let params: { tenantId: string }

  it('should render add protocol layout correctly', async () => {
    render(
      <Provider>
        <ConnectionCapabilityDrawer
          visible={true}
          editData={null as unknown as Hotspot20ConnectionCapability}
        />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Protocol')).toBeVisible()
    expect(screen.getByText('Protocol')).toBeVisible()
    expect(screen.getByText('Protocol Number')).toBeVisible()
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  it('should render edit protocol layout correctly', async () => {
    render(
      <Provider>
        <ConnectionCapabilityDrawer
          visible={true}
          editData={
            {
              protocol: 'test',
              protocolNumber: 123,
              port: 6,
              status: 'OPEN'
            } as Hotspot20ConnectionCapability}
        />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Edit Protocol')).toBeVisible()
    expect(screen.getByText('Protocol')).toBeVisible()
    expect(screen.getByText('Protocol Number')).toBeVisible()
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})