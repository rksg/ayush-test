import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                   from '@acx-ui/components'
import { QosPriorityEnum, WifiCallingSetting } from '@acx-ui/rc/utils'

import { wifiCallingQosPriorityLabelMapping } from '../../../../Services/contentsMap'

import { WifiCallingSettingContext } from './NetworkControlTab'




const WifiCallingSettingTable = () => {
  const { $t } = useIntl()

  const { wifiCallingSettingList }= useContext(WifiCallingSettingContext)
  const compactColumns: TableProps<WifiCallingSetting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Selected Profile' }),
      dataIndex: 'serviceName',
      key: 'serviceName'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description'
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
    columns={compactColumns}
    dataSource={wifiCallingSettingList}
    type={'form'}
  />
}

export default WifiCallingSettingTable
