import { useRef, useState } from 'react'

import { ActionType as AntdTableActionType } from '@ant-design/pro-table/lib/typing'
import { Switch }                            from 'antd'
import { useIntl }                           from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip }                  from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable, ToolTipTableStyle, useEdgeMdnsActions } from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyViewDataListQuery }                                 from '@acx-ui/rc/services'
import {
  EdgeMdnsProxyUrls,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceDetailsLink,
  MdnsProxyFeatureTypeEnum,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { EdgeScopes }            from '@acx-ui/types'
import { hasPermission }         from '@acx-ui/user'
import { getOpsApi }             from '@acx-ui/utils'

import { TableTitle } from '../styledComponents'

import AddMdnsProxyInstanceDrawer from './AddMdnsProxyInstanceDrawer'
import ChangeMdnsProxyDrawer      from './ChangeMdnsProxyDrawer'
import { EdgeMdnsProxyInstance }  from './types'

export const EdgeMdnsTab = () => {
  const { $t } = useIntl()
  const { venueId } = useParams()

  const tableRef = useRef<AntdTableActionType>()
  const [ addInstanceDrawerVisible, setAddInstanceDrawerVisible ] = useState(false)
  const [selectedRow, setSelectedRow] = useState<EdgeMdnsProxyInstance|undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const { deactivateEdgeMdnsCluster } = useEdgeMdnsActions()

  const { tableData, isLoading, isFetching } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'forwardingRules', 'activations'],
      filters: { 'activations.venueId': [venueId] }
    }
  }, {
    skip: !venueId,
    selectFromResult: ({ data, isLoading, isFetching }) => {
      return {
        tableData: data?.data.flatMap(item => item.activations
          ?.filter(item => item.venueId === venueId)
          .map(activation => ({
            edgeClusterId: activation.edgeClusterId,
            edgeClusterName: activation.edgeClusterName,
            serviceId: item.id,
            serviceName: item.name,
            forwardingRules: item.forwardingRules
          })) ?? []) ?? [],
        isLoading,
        isFetching
      }
    }
  })

  const handleAddAction = () => {
    setAddInstanceDrawerVisible(true)
  }

  const handleCloseChangeMdnsProxy = () => {
    setSelectedRow(undefined)
  }

  // eslint-disable-next-line max-len
  const doDeactivate = (row: EdgeMdnsProxyInstance, sentCallback?: () => void) => {
    if (!row.serviceId || !row.edgeClusterId) {
      // eslint-disable-next-line no-console
      console.error('Missing serviceId or edgeClusterId')
      sentCallback?.()
      return
    }

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Instance' }),
        entityValue: row.edgeClusterName,
        numOfEntities: 1
      },
      onOk: () => {
        setIsProcessing(true)
        deactivateEdgeMdnsCluster(
          row.serviceId!,
          venueId!,
          row.edgeClusterId!,
          () => {setIsProcessing(false)}
        ).then(sentCallback)
      }
    })
  }

  const rowActions: TableProps<EdgeMdnsProxyInstance>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Change' }),
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster)],
      onClick: (rows: EdgeMdnsProxyInstance[]) => {
        setSelectedRow(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Remove' }),
      scopeKey: [EdgeScopes.DELETE],
      rbacOpsIds: [getOpsApi(EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster)],
      onClick: (rows: EdgeMdnsProxyInstance[], clearSelection) => {
        doDeactivate(rows[0], clearSelection)
      }
    }
  ]

  const columns: TableProps<EdgeMdnsProxyInstance>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster Name' }),
      dataIndex: 'edgeClusterName',
      key: 'edgeClusterName',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        // eslint-disable-next-line max-len
        return <TenantLink to={`/devices/edge/cluster/${row.edgeClusterId}/edit/cluster-details`}>
          {row.edgeClusterName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Service' }),
      dataIndex: 'serviceName',
      key: 'serviceName',
      sorter: true,
      render: (_, row) => {
        return row.serviceId && <TenantLink
          to={getServiceDetailsLink({
            type: ServiceType.EDGE_MDNS_PROXY,
            oper: ServiceOperation.DETAIL,
            serviceId: row.serviceId
          })}>
          {row.serviceName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Forwarding Rules' }),
      dataIndex: 'forwardingRules',
      key: 'forwardingRules',
      align: 'center' as const,
      render: (_, { forwardingRules }) => {
        return forwardingRules?.length
          ? <Tooltip
            title={<MdnsProxyForwardingRulesTable
              featureType={MdnsProxyFeatureTypeEnum.EDGE}
              rowKey='ruleIndex'
              readonly
              tableType={'compactBordered'}
              rules={forwardingRules}
            />}
            children={forwardingRules.length}
            dottedUnderline
            placement='bottom'
            overlayClassName={ToolTipTableStyle.toolTipClassName}
            overlayInnerStyle={{ minWidth: 380 }}
          />
          : 0
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'multicasDnsProxyServiceProfileId',
      key: 'multicasDnsProxyServiceProfileId',
      align: 'center' as const,
      render: function (_, row) {
        return <Switch
          checked={true}
          disabled={!hasPermission({
            scopes: [EdgeScopes.DELETE],
            rbacOpsIds: [getOpsApi(EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster)] })}
          onClick={(_, event) => {
            event.stopPropagation()
          }}
          onChange={(checked) => {
            if (checked) return
            doDeactivate(row, tableRef.current?.clearSelected)
          }}
        />
      }
    }
  ]

  return (
    <>
      <TableTitle>
        { $t({ defaultMessage: 'RUCKUS Edge clusters Running mDNS Proxy service' }) }
      </TableTitle>
      <Loader states={[{
        isFetching: isFetching || isProcessing,
        isLoading: isLoading
      }]}>
        <ToolTipTableStyle.ToolTipStyle/>
        <Table
          actionRef={tableRef}
          columns={columns}
          dataSource={tableData}
          actions={filterByAccessForServicePolicyMutation([{
            label: $t({ defaultMessage: 'Add Instance' }),
            onClick: handleAddAction,
            scopeKey: getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.EDIT),
            // eslint-disable-next-line max-len
            rbacOpsIds: [getOpsApi(EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster)]
          }])}
          rowKey='edgeClusterId'
          rowActions={filterByAccessForServicePolicyMutation(rowActions)}
          rowSelection={
            hasPermission({ scopes: [EdgeScopes.UPDATE] }) && { type: 'radio' }
          }
        />
      </Loader>

      {venueId && <AddMdnsProxyInstanceDrawer
        visible={addInstanceDrawerVisible}
        setVisible={setAddInstanceDrawerVisible}
        venueId={venueId}
      />}
      {venueId && <ChangeMdnsProxyDrawer
        visible={Boolean(selectedRow)}
        onClose={handleCloseChangeMdnsProxy}
        venueId={venueId}
        row={selectedRow}
      />}
    </>
  )
}