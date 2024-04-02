import { useEffect, useState } from 'react'

import { Form, List } from 'antd'
import { useIntl }    from 'react-intl'

import { useGetWifiOperatorListQuery } from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  WifiOperatorViewModel,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

export function Hotspot20SummaryForm (props: {
    summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  const { $t } = useIntl()
  const [ selectedOperator, setSelectedOperator ] = useState<WifiOperatorViewModel>()

  const operatorPayload = {
    searchString: '',
    pageSize: 100,
    filter: [ summaryData.hotspot20Settings?.wifiOperator ],
    fields: [
      'name',
      'id'
    ]
  }

  const { data: operatorList } = useGetWifiOperatorListQuery({ payload: operatorPayload })

  useEffect(() => {
    const wifiOperator = operatorList?.data.find(operator =>
      operator.id === summaryData.hotspot20Settings?.wifiOperator)
    if (operatorList?.data && wifiOperator !== undefined) {
      setSelectedOperator(wifiOperator as WifiOperatorViewModel )
    }
  }, [summaryData.hotspot20Settings?.wifiOperator, operatorList])

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
          { operator: selectedOperator?.name ?? '--' })}
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
                {item}
              </List.Item>
            }
          />
        }
      />
    </>
  )
}