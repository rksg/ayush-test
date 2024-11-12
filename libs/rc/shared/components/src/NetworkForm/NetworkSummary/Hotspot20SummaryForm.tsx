import { useEffect, useState } from 'react'

import { Form, List } from 'antd'
import { useIntl }    from 'react-intl'

import { useGetIdentityProviderListQuery, useGetWifiOperatorListQuery } from '@acx-ui/rc/services'
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
  const [ selectedProviders, setSelectedProviders ] = useState<string[]>()

  const operatorPayload = {
    searchString: '',
    pageSize: 100,
    filter: [ summaryData.hotspot20Settings?.wifiOperator ],
    fields: [
      'name',
      'id'
    ]
  }

  const providerPayload = {
    searchString: '',
    pageSize: 100,
    filter: summaryData.hotspot20Settings?.identityProviders,
    fields: [
      'name',
      'id'
    ]
  }

  const { data: operatorList } = useGetWifiOperatorListQuery({ payload: operatorPayload })
  const { data: providerList } = useGetIdentityProviderListQuery({ payload: providerPayload })

  useEffect(() => {
    const wifiOperator = operatorList?.data.find(operator =>
      operator.id === summaryData.hotspot20Settings?.wifiOperator)
    if (operatorList?.data && wifiOperator !== undefined) {
      setSelectedOperator(wifiOperator as WifiOperatorViewModel )
    }
  }, [summaryData.hotspot20Settings?.wifiOperator, operatorList])

  useEffect(() => {
    const providers = providerList?.data.filter(provider =>
      provider.id !== undefined &&
      summaryData.hotspot20Settings?.identityProviders !== undefined &&
      summaryData.hotspot20Settings?.identityProviders.includes(provider.id) ).map(rec => rec.name)
    setSelectedProviders(providers)
  }, [summaryData.hotspot20Settings?.identityProviders, providerList])

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
            dataSource={selectedProviders ?? ['--']}
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