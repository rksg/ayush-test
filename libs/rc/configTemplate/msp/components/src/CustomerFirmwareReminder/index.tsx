import { useIntl } from 'react-intl'

import { ConfigTemplatePageUI } from '@acx-ui/main/components'
import { MspTenantLink }        from '@acx-ui/react-router-dom'

export function CustomerFirmwareReminder () {
  const { $t } = useIntl()
  return <ConfigTemplatePageUI.Warning>{
    // eslint-disable-next-line max-len
    $t({ defaultMessage: 'Ensure customer AP Firmware matches the template version to avoid compatibility issues. Upgrade AP Firmware for a customer in {link} by selecting {action}' }, {
      link: <MspTenantLink to='/dashboard/mspCustomers'>
        {$t({ defaultMessage: 'MSP Customers' })}
      </MspTenantLink>,
      action: <b>{$t({ defaultMessage: 'Schedule Firmware Update' })}</b>
    })
  }</ConfigTemplatePageUI.Warning>
}
