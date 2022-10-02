import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { LayoutProps, genPlaceholder } from '@acx-ui/components'
import {
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  MspSubscriptionOutlined as MspSubscriptionOutlinedOriginal,
  MspSubscriptionSolid as MspSubscriptionSolidOriginal,
  ServicesOutlined,
  ServicesSolid,
  UsersThreeOutlined,
  UsersThreeSolid
} from '@acx-ui/icons'

const MspSubscriptionOutlined = styled(MspSubscriptionOutlinedOriginal)`
  path { stroke: none !important; }
`
const MspSubscriptionSolid = styled(MspSubscriptionSolidOriginal)`
  path { stroke: none !important; }
`

export function useMenuConfig () {
  const { $t } = useIntl()
  const config: LayoutProps['menuConfig'] = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'My Customers' }),
      tenantType: 'v',
      disableIcon: UsersThreeOutlined,
      enableIcon: UsersThreeSolid,
      routes: [
        {
          path: '/dashboard/mspCustomers',
          name: $t({ defaultMessage: 'MSP Customers' })
        },
        {
          path: '/dashboard/varCustomers',
          name: $t({ defaultMessage: 'VAR Customers' })
        }
      ]
    },
    {
      path: '/integrators',
      name: $t({ defaultMessage: 'Integrators' }),
      tenantType: 'v',
      disableIcon: ServicesOutlined,
      enableIcon: ServicesSolid
    },
    {
      path: '/deviceInventory',
      name: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v',
      disableIcon: DevicesOutlined,
      enableIcon: DevicesSolid
    },
    {
      path: '/mspLicenses',
      name: $t({ defaultMessage: 'MSP Licenses' }),
      tenantType: 'v',
      disableIcon: MspSubscriptionOutlined,
      enableIcon: MspSubscriptionSolid
    },
    genPlaceholder(),
    {
      path: '/portalSetting',
      name: $t({ defaultMessage: 'Settings' }),
      tenantType: 'v',
      disableIcon: ConfigurationOutlined,
      enableIcon: ConfigurationSolid
    }
  ]
  return config
}
