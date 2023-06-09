import { QuestionCircleOutlined } from '@ant-design/icons'
import { Space, Typography }      from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'

import { defaultSort, sortProp }                       from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip }                  from '@acx-ui/components'
import {
  EdgeFirewallACLStatsViewData, transformDisplayText } from '@acx-ui/rc/utils'

interface ACLOtherInfoTableProps {
  stats: EdgeFirewallACLStatsViewData | undefined
}

interface ACLOtherInfo {
  description: string;
  hits?: number;
}

export const ACLOtherInfoTable = (props: ACLOtherInfoTableProps) => {
  const { $t } = useIntl()
  const { stats } = props

  const ACLOtherInfoMap = [{
    description: $t({ defaultMessage: 'Permmited by ACL Sessions' }),
    dataIndex: 'permittedSessions'
  }]

  const ACLOtherInfoColumns: TableProps<ACLOtherInfo>['columns'] = [
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      sorter: { compare: sortProp('description', defaultSort) }
    },
    {
      title: <Space size={3}>
        <Typography.Text>
          {$t({ defaultMessage: 'Hits' })}
        </Typography.Text>
        <Tooltip
          placement='topRight'
          title={
            $t({ defaultMessage: 'Hit counts would be cleared when the rule has any changes' })
          }
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>,
      key: 'hits',
      dataIndex: 'hits',
      sorter: { compare: sortProp('hits', defaultSort) },
      render: (_, row) => transformDisplayText(isNaN(Number(row.hits))
        ? undefined
        : row.hits?.toString()
      )
    }
  ]

  const dataSrc = ACLOtherInfoMap.map((item) => ({
    description: item.description,
    hits: _.get(stats, item.dataIndex)
  }))

  return <Table
    columns={ACLOtherInfoColumns}
    dataSource={dataSrc}
    rowKey='description'
  />
}