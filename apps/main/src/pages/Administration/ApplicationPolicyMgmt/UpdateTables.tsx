import { useIntl } from 'react-intl'

import { Table, TableProps }       from '@acx-ui/components'
import { SimpleListTooltip }       from '@acx-ui/rc/components'
import { ApplicationInfo }         from '@acx-ui/rc/utils'
import { filterByAccess }          from '@acx-ui/user'
import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'


type APPTableProps = {
  actions: { label:string, onClick?: ()=>void }[],
  data: ApplicationInfo[]
}
const getRulesInfo = (row: ApplicationInfo)=>{
  if (!row.impactedItems || row.impactedItems.length === 0) return 0
  const impactedItems = row.impactedItems
  const tooltipItems = impactedItems.map(v => v.applicationPolicyName +
    '-' + v.applicationPolicyRuleName)
  return <SimpleListTooltip items={tooltipItems} displayText={impactedItems.length} />
}
const pagination = {
  pageSize: TABLE_DEFAULT_PAGE_SIZE
}
export const NewAPPTable=(props: APPTableProps)=>{
  const { $t } = useIntl()
  const newColumn: TableProps<ApplicationInfo>['columns'] =[
    {
      title: $t({ defaultMessage: 'Application Name' }),
      key: 'toApplicationName',
      dataIndex: 'toApplicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'toCategoryName',
      dataIndex: 'toCategoryName',
      sorter: false
    }
  ]
  return (<Table<ApplicationInfo>
    columns={newColumn}
    dataSource={props.data}
    rowKey='toApplicationId'
    actions={filterByAccess(props.actions)}
    pagination={pagination}
  />)
}
export const UpdateAPPTable=(props: APPTableProps)=>{
  const { $t } = useIntl()

  const updateColumn: TableProps<ApplicationInfo>['columns'] =[
    {
      title: $t({ defaultMessage: 'Application Name' }),
      key: 'applicationName',
      dataIndex: 'applicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Current Application Category' }),
      key: 'categoryName',
      dataIndex: 'categoryName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'New Application Category' }),
      key: 'toCategoryName',
      dataIndex: 'toCategoryName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedRules',
      dataIndex: 'impactedRules',
      sorter: false,
      align: 'center',
      render: (data, row)=>{
        return getRulesInfo(row)
      }
    }
  ]

  return (<Table<ApplicationInfo>
    columns={updateColumn}
    dataSource={props.data}
    rowKey='toApplicationId'
    actions={filterByAccess(props.actions)}
    pagination={pagination}
  />)
}
export const MergedAPPTable=(props: APPTableProps)=>{
  const { $t } = useIntl()
  const mergedColumn: TableProps<ApplicationInfo>['columns'] =[
    {
      title: $t({ defaultMessage: 'Current Applications' }),
      key: 'applicationName',
      dataIndex: 'applicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'New Application Name' }),
      key: 'toApplicationName',
      dataIndex: 'toApplicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'toCategoryName',
      dataIndex: 'toCategoryName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedItems',
      dataIndex: 'impactedItems',
      sorter: false,
      align: 'center',
      render: (data, row)=>{
        return getRulesInfo(row)
      }
    }
  ]

  return (<Table<ApplicationInfo>
    columns={mergedColumn}
    dataSource={props.data}
    rowKey='toApplicationId'
    actions={filterByAccess(props.actions)}
    pagination={pagination}
  />)
}
export const RemovedAPPTable=(props: APPTableProps)=>{
  const { $t } = useIntl()
  const removedColumn: TableProps<ApplicationInfo>['columns'] =[
    {
      title: $t({ defaultMessage: 'Application Name' }),
      key: 'applicationName',
      dataIndex: 'applicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'categoryName',
      dataIndex: 'categoryName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedItems',
      dataIndex: 'impactedItems',
      sorter: false,
      align: 'center',
      render: (data, row)=>{
        return getRulesInfo(row)
      }
    }
  ]
  return (<Table<ApplicationInfo>
    columns={removedColumn}
    dataSource={props.data}
    rowKey='applicationId'
    actions={filterByAccess(props.actions)}
    pagination={pagination}
  />)
}
export const ChangedAPPTable=(props: APPTableProps)=>{
  const { $t } = useIntl()
  const changedColumn: TableProps<ApplicationInfo>['columns'] =[
    {
      title: $t({ defaultMessage: 'Current Application Name' }),
      key: 'applicationName',
      dataIndex: 'applicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'New Application Name' }),
      key: 'toApplicationName',
      dataIndex: 'toApplicationName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'categoryName',
      dataIndex: 'categoryName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedItems',
      dataIndex: 'impactedItems',
      sorter: false,
      align: 'center',
      render: (data, row)=>{
        return getRulesInfo(row)
      }
    }
  ]
  return (<Table<ApplicationInfo>
    columns={changedColumn}
    dataSource={props.data}
    rowKey='toApplicationId'
    actions={filterByAccess(props.actions)}
    pagination={pagination}
  />)
}
