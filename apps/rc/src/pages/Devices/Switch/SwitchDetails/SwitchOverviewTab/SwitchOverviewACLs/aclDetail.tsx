import {
  Form } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { TableProps } from '@acx-ui/components'
import {
  Table
} from '@acx-ui/components'
import { Acl, AclRule, transformTitleCase } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'
export const AclDetail = (props: { row : Acl }) => {
  const { $t } = useIntl()
  const { row } = props
  // eslint-disable-next-line max-len
  const subtitle = $t({ defaultMessage: 'ACL settings as defined in the switch configuration profile or via CLI directly to the switch' })

  const standardColumns: TableProps<AclRule>['columns'] = [
    {
      key: 'sequence',
      title: $t({ defaultMessage: 'Sequence#' }),
      dataIndex: 'sequence',
      defaultSortOrder: 'ascend'
    },

    {
      key: 'action',
      title: $t({ defaultMessage: 'Action' }),
      dataIndex: 'action'
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source'
    }]

  const extendedColumns: TableProps<AclRule>['columns'] = [
    {
      key: 'sequence',
      title: $t({ defaultMessage: 'Sequence#' }),
      dataIndex: 'sequence',
      defaultSortOrder: 'ascend'
    },
    {
      key: 'action',
      title: $t({ defaultMessage: 'Action' }),
      dataIndex: 'action',
      render: (_, { action }) => transformTitleCase(action as string)
    },
    {
      key: 'protocol',
      title: $t({ defaultMessage: 'Protocol' }),
      dataIndex: 'protocol',
      render: (__, { protocol }) => {
        return _.isString(protocol) ? _.toUpper(protocol) : protocol
      }
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source Network' }),
      dataIndex: 'source'
    },
    {
      key: 'destination',
      title: $t({ defaultMessage: 'Dest. Network' }),
      dataIndex: 'destination'
    },
    {
      key: 'sourcePort',
      title: $t({ defaultMessage: 'Source Port' }),
      dataIndex: 'sourcePort'
    },
    {
      key: 'destinationPort',
      title: $t({ defaultMessage: 'Dest. Port' }),
      dataIndex: 'destinationPort'
    }]
  return (

    <Form
      labelCol={{ span: 10 }}
      labelAlign='left'
    >
      <UI.SubTitle>{subtitle}</UI.SubTitle>
      <Form.Item
        label={$t({ defaultMessage: 'ACL Name:' })}
        children={row.name}
      />
      <Form.Item
        style={{ paddingBottom: '50px' }}
        label={$t({ defaultMessage: 'Type:' })}
        children={transformTitleCase(row.aclType)}
      />

      {row.aclType === 'standard' && <Table
        columns={standardColumns}
        type={'form'}
        dataSource={row.aclRules}
        rowKey='id'
      />}


      {row.aclType === 'extended' && <Table
        columns={extendedColumns}
        type={'form'}
        dataSource={row.aclRules}
        rowKey='id'
      />
      }

    </Form>
  )
}

