import React, { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }  from '@acx-ui/components'
import { WifiCallingSetting } from '@acx-ui/rc/utils'

import { WifiCallingSettingContext } from './ServicesForm'


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
      key: 'qosPriority'
    }
  ]

  return <Table style={{ width: '355px' }}
    columns={compactColumns}
    dataSource={wifiCallingSettingList}
    type={'form'}
  />
}

export default WifiCallingSettingTable
