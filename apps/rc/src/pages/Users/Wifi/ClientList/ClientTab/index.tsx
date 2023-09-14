import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { ClientDualTable }                       from '@acx-ui/rc/components'

import { ClientConnectionDiagnosis } from './CCD'

export function ClientTab () {
  const isSupportCCD = useIsSplitOn(Features.CCD_TOGGLE)
  const { $t } = useIntl()

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wireless Clients' }),
      value: 'clientTable',
      children: <ClientDualTable />
    },
    {
      label: $t({ defaultMessage: 'Diagnostics' }),
      value: 'diagnostics',
      children: <ClientConnectionDiagnosis />
    }
  ]

  const onTabChange = (value: string): void => {
    localStorage.setItem('client-tab', value)
  }

  return (isSupportCCD?
    <ContentSwitcher
      tabDetails={tabDetails}
      size='large'
      defaultValue={localStorage.getItem('client-tab') || tabDetails[0].value}
      onChange={onTabChange}
    /> : <ClientDualTable />
  )
}
