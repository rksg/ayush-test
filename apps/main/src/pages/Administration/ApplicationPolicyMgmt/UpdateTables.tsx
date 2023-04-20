import { useIntl } from 'react-intl'

import { Table, TableProps }     from '@acx-ui/components'
import { ApplicationPolicyMgmt } from '@acx-ui/rc/utils'
import { filterByAccess }        from '@acx-ui/user'


export const NewAPPTable=(props:{
  actions: { label:string, click?: ()=>void }[]
})=>{
  const { $t } = useIntl()
  const tableActions = []
  tableActions.push({
    label: $t({ defaultMessage: 'Export All' })
  })
  tableActions.push({
    label: $t({ defaultMessage: 'Export Current List' })
  })
  const newColumn: TableProps<ApplicationPolicyMgmt>['columns'] =[
    {
      title: $t({ defaultMessage: 'Application Name' }),
      key: 'appName',
      dataIndex: 'appName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'appCategory',
      dataIndex: 'appCategory',
      sorter: false
    }
  ]
  return (<Table<ApplicationPolicyMgmt>
    type='form'
    columns={newColumn}
    dataSource={[]}
    actions={filterByAccess(props.actions)}
  />)
}
export const UpdateAPPTable=(props:{
    actions: { label:string, click?: ()=>void }[]
})=>{
  const { $t } = useIntl()

  const updateColumn: TableProps<ApplicationPolicyMgmt>['columns'] =[
    {
      title: $t({ defaultMessage: 'Application Name' }),
      key: 'appName',
      dataIndex: 'appName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Current Application Category' }),
      key: 'appCurrentCategory',
      dataIndex: 'appCurrentCategory',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'New Application Category' }),
      key: 'appNewCategory',
      dataIndex: 'appNewCategory',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedRules',
      dataIndex: 'impactedRules',
      sorter: false,
      render: (data, row)=>{
        return data+row.appName
      }
    }
  ]

  return (<Table<ApplicationPolicyMgmt>
    type='form'
    columns={updateColumn}
    dataSource={[]}
    actions={filterByAccess(props.actions)}
  />)
}
export const MergedAPPTable=(props:{
    actions: { label:string, click?: ()=>void }[]
})=>{
  const { $t } = useIntl()
  const mergedColumn: TableProps<ApplicationPolicyMgmt>['columns'] =[
    {
      title: $t({ defaultMessage: 'Current Applications' }),
      key: 'appMergedName',
      dataIndex: 'appMergedName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'New Application Name' }),
      key: 'appNewName',
      dataIndex: 'appNewName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'appCategory',
      dataIndex: 'appCategory',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedRules',
      dataIndex: 'impactedRules',
      sorter: false,
      render: (data, row)=>{
        return data+row.appName
      }
    }
  ]

  return (<Table<ApplicationPolicyMgmt>
    type='form'
    columns={mergedColumn}
    dataSource={[]}
    actions={filterByAccess(props.actions)}
  />)
}
export const RemovedAPPTable=(props:{
    actions: { label:string, click?: ()=>void }[]
})=>{
  const { $t } = useIntl()
  const removedColumn: TableProps<ApplicationPolicyMgmt>['columns'] =[
    {
      title: $t({ defaultMessage: 'Application Name' }),
      key: 'appName',
      dataIndex: 'appName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Application Category' }),
      key: 'appCategory',
      dataIndex: 'appCategory',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedRules',
      dataIndex: 'impactedRules',
      sorter: false,
      render: (data, row)=>{
        return data+row.appName
      }
    }
  ]
  return (<Table<ApplicationPolicyMgmt>
    type='form'
    columns={removedColumn}
    dataSource={[]}
    actions={filterByAccess(props.actions)}
  />)
}
export const ChangedAPPTable=(props:{
    actions: { label:string, click?: ()=>void }[]
})=>{
  const { $t } = useIntl()
  const changedColumn: TableProps<ApplicationPolicyMgmt>['columns'] =[
    {
      title: $t({ defaultMessage: 'Current Application Name' }),
      key: 'appCurrentName',
      dataIndex: 'appCurrentName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'New Application Name' }),
      key: 'appNewName',
      dataIndex: 'appNewName',
      sorter: false
    }, {
      title: $t({ defaultMessage: 'Impacted Rules' }),
      key: 'impactedRules',
      dataIndex: 'impactedRules',
      sorter: false,
      render: (data, row)=>{
        return data+row.appName
      }
    }
  ]
  return (<Table<ApplicationPolicyMgmt>
    type='form'
    columns={changedColumn}
    dataSource={[]}
    actions={filterByAccess(props.actions)}
  />)
}
