import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                                                    from '@acx-ui/components'
import { useGetWifiCallingServiceQuery, useGetWifiCallingServiceTemplateQuery } from '@acx-ui/rc/services'
import {
  QosPriorityEnum,
  WifiCallingSetting,
  wifiCallingQosPriorityLabelMapping,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'

import { WifiCallingSettingContext } from './NetworkControlTab'

const WifiCallingSettingTable = () => {
  const { $t } = useIntl()

  const { wifiCallingSettingList }= useContext(WifiCallingSettingContext)
  const compactColumns: TableProps<WifiCallingSetting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Selected Profile' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'id',
      key: 'id',
      render: (_, value) => {
        return <WifiCallingNameContent id={value.id} />
      }
    },
    {
      title: $t({ defaultMessage: 'QosPriority' }),
      dataIndex: 'qosPriority',
      key: 'qosPriority',
      render: (_, value) => {
        return $t(wifiCallingQosPriorityLabelMapping[value.qosPriority as QosPriorityEnum])
      }
    }
  ]

  return <Table style={{ width: '355px' }}
    rowKey='id'
    columns={compactColumns}
    dataSource={wifiCallingSettingList}
    type={'form'}
  />
}

export default WifiCallingSettingTable

const WifiCallingNameContent = (props: { id: string }) => {
  const { id } = props
  const { data } = useConfigTemplateQueryFnSwitcher(
    useGetWifiCallingServiceQuery, useGetWifiCallingServiceTemplateQuery,
    false,
    null,
    { serviceId: id }
  )

  return <div>
    {data?.description || ''}
  </div>
}
