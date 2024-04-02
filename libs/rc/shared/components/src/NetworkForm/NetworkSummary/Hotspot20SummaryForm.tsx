import { Form, List } from 'antd'
import { useIntl }    from 'react-intl'

import { NetworkSaveData, WlanSecurityEnum } from '@acx-ui/rc/utils'

export function Hotspot20SummaryForm (props: {
    summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  const { $t } = useIntl()

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Security Protocol' })}
        children={$t({ defaultMessage: '{security}' },
          { security:
            summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA2Enterprise ? 'WPA2' : 'WPA3' })}
      />

      <Form.Item
        label={$t({ defaultMessage: 'Wi-Fi Operator' })}
        children={$t({ defaultMessage: '{operator}' },
          { operator: summaryData.hotspot20Settings?.wifiOperator?.label as string })}
      />

      <Form.Item
        label={$t({ defaultMessage: 'Identity Provider' })}
        children={
          <List
            split={false}
            size='small'
            dataSource={summaryData.hotspot20Settings?.identityProviders}
            renderItem={(item) =>
              <List.Item
                style={{ paddingLeft: '0px' }}>
                {item.label}
              </List.Item>
            }
          />
        }
      />
    </>
  )
}