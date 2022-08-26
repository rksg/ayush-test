import { useIntl } from 'react-intl'

import { LayoutProps } from '@acx-ui/components'

import * as UI from './styledComponents'

export function useMenuConfig () {
  const { $t } = useIntl()
  const config: LayoutProps['menuConfig'] = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'Dashboard' }),
      tenantType: 'v',
      disableIcon: UI.SpeedIndicatorIcon,
      enableIcon: UI.EnabledSpeedIndicatorIcon
    }
  ]
  return config
}
