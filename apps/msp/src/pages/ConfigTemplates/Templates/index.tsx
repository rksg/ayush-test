import { useState } from 'react'

import { MenuProps } from 'antd'
import moment        from 'moment'
import { useIntl }   from 'react-intl'


import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { DateFormatEnum, userDateTimeFormat }                                            from '@acx-ui/formatter'
import { ConfigTemplateLink, PolicyConfigTemplateLink, renderConfigTemplateDetailsLink } from '@acx-ui/msp/components'
import { useGetConfigTemplateListQuery }                                                 from '@acx-ui/msp/services'
import { ConfigTemplate }                                                                from '@acx-ui/msp/utils'
import {
  PolicyOperation,
  PolicyType,
  policyTypeLabelMapping,
  useTableQuery
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import { ApplyTemplateDrawer } from './ApplyTemplateDrawer'
import * as UI                 from './styledComponents'


export function ConfigTemplateList () {
  const { $t } = useIntl()
  const [ applyTemplateDrawerVisible, setApplyTemplateDrawerVisible ] = useState(false)
  const [ selectedTemplates, setSelectedTemplates ] = useState<ConfigTemplate[]>([])

  const tableQuery = useTableQuery({
    useQuery: useGetConfigTemplateListQuery,
    defaultPayload: {}
  })

  const rowActions: TableProps<ConfigTemplate>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Apply Template' }),
      onClick: (rows: ConfigTemplate[]) => {
        setSelectedTemplates(rows)
        setApplyTemplateDrawerVisible(true)
      }
    }
  ]

  const actions: TableProps<ConfigTemplate>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Template' }),
      dropdownMenu: getAddTemplateMenuProps()
    }
  ]

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<ConfigTemplate>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          actions={filterByAccess(actions)}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
      {applyTemplateDrawerVisible &&
      <ApplyTemplateDrawer
        setVisible={setApplyTemplateDrawerVisible}
        selectedTemplates={selectedTemplates}
      />}
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const dateFormat = userDateTimeFormat(DateFormatEnum.DateTimeFormatWithSeconds)

  const columns: TableProps<ConfigTemplate>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => {
        return renderConfigTemplateDetailsLink(row.templateType, row.id!, row.name)
      }
    },
    {
      key: 'templateType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'templateType',
      sorter: true
    },
    {
      key: 'appliedTo',
      title: $t({ defaultMessage: 'Applied To' }),
      dataIndex: 'appliedTo',
      sorter: true,
      align: 'center'
    },
    {
      key: 'createdBy',
      title: $t({ defaultMessage: 'Created By' }),
      dataIndex: 'createdBy',
      sorter: true
    },
    {
      key: 'createdOn',
      title: $t({ defaultMessage: 'Created On' }),
      dataIndex: 'createdOn',
      sorter: true,
      render: function (_, row) {
        return moment(row.createdOn).format(dateFormat)
      }
    },
    {
      key: 'lastModified',
      title: $t({ defaultMessage: 'Last Modified' }),
      dataIndex: 'lastModified',
      sorter: true,
      render: function (_, row) {
        return moment(row.lastModified).format(dateFormat)
      }
    },
    {
      key: 'lastApplied',
      title: $t({ defaultMessage: 'Last Applied' }),
      dataIndex: 'lastApplied',
      sorter: true,
      render: function (_, row) {
        return row.lastApplied ? moment(row.lastApplied).format(dateFormat) : ''
      }
    }
  ]

  return columns
}

function getAddTemplateMenuProps (): Omit<MenuProps, 'placement'> {
  const { $t } = getIntl()

  return {
    expandIcon: <UI.MenuExpandArrow />,
    items: [{
      key: 'add-wifi-network',
      label: <ConfigTemplateLink to='networks/wireless/add'>
        {$t({ defaultMessage: 'Wi-Fi Network' })}
      </ConfigTemplateLink>
    }, {
      key: 'add-policy',
      label: $t({ defaultMessage: 'Policies' }),
      children: [{
        key: 'add-aaa',
        label: <PolicyConfigTemplateLink type={PolicyType.AAA} oper={PolicyOperation.CREATE}>
          {$t(policyTypeLabelMapping[PolicyType.AAA])}
        </PolicyConfigTemplateLink>
      }]
    }]
  }
}
