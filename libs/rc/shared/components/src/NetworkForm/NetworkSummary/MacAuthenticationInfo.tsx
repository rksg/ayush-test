import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useMacRegListsQuery }        from '@acx-ui/rc/services'
import {
  macAuthMacFormatOptions,
  MacRegistrationPool,
  NetworkSaveData
} from '@acx-ui/rc/utils'

export function MacAuthenticationInfo (props: {
  summaryData: NetworkSaveData
}) {
  const { $t } = useIntl()
  const { summaryData } = props

  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { data: macRegListOption } = useMacRegListsQuery({
    payload: { pageSize: 10000 }
  }, { skip: !macRegistrationEnabled })

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Use MAC Auth:' })}
        children={
          summaryData.wlan?.macAddressAuthentication
            ? $t({ defaultMessage: 'Enabled' })
            : $t({ defaultMessage: 'Disabled' })
        }
      />

      {summaryData.wlan?.macAddressAuthentication &&
      summaryData.wlan?.isMacRegistrationList ? (
          <Form.Item
            label={$t({ defaultMessage: 'Mac registration list:' })}
            children={
              `${macRegListOption?.data.find(
                (regList: MacRegistrationPool) =>
                  regList.id === summaryData.wlan?.macRegistrationListId
              )?.name}`
            }
          />
        ) : null}

      {summaryData.wlan?.macAddressAuthentication &&
        !summaryData.wlan?.isMacRegistrationList && (
        <Form.Item
          label={$t({ defaultMessage: 'MAC Address Format:' })}
          children={
            macAuthMacFormatOptions[
                summaryData.wlan
                  ?.macAuthMacFormat as keyof typeof macAuthMacFormatOptions
            ]
          }
        />
      )}
    </>
  )
}