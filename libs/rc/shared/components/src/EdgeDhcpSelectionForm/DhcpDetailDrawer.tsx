import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps }        from '@acx-ui/components'
import { useGetDhcpStatsQuery, useGetEdgeDhcpServiceQuery } from '@acx-ui/rc/services'
import { EdgeDhcpPool, transformDisplayOnOff }              from '@acx-ui/rc/utils'
import { noDataDisplay }                                    from '@acx-ui/utils'

interface DhcpDetailDrawerProps {
  dhcpId?: string
}

export const DhcpDetailDrawer = (props: DhcpDetailDrawerProps) => {
  const { dhcpId } = props
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)

  const { currentDhcp, isCurrentDhcpFetching } = useGetEdgeDhcpServiceQuery(
    { params: { id: dhcpId } },
    {
      skip: !Boolean(dhcpId),
      selectFromResult: ({ data, isFetching }) => ({
        currentDhcp: data,
        isCurrentDhcpFetching: isFetching
      })
    }
  )
  const { currentDhcpStats, isCurrentDhcpStatsFetching } = useGetDhcpStatsQuery(
    { payload: { fields: ['leaseTime'], filters: { id: [dhcpId] } } },
    {
      skip: !Boolean(dhcpId),
      selectFromResult: ({ data, isFetching }) => ({
        currentDhcpStats: data?.data?.[0],
        isCurrentDhcpStatsFetching: isFetching
      })
    }
  )

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<EdgeDhcpPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool Name' }),
      key: 'poolName',
      dataIndex: 'poolName'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'poolStartIp',
      dataIndex: 'poolStartIp',
      width: 150,
      render (_, item) {
        return `${item.poolStartIp} - ${item.poolEndIp}`
      }
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'gatewayIp',
      dataIndex: 'gatewayIp'
    }
  ]

  const content = (
    <Loader states={[{
      isLoading: isCurrentDhcpFetching || isCurrentDhcpStatsFetching
    }]}>
      <Form
        labelCol={{ span: 6 }}
        labelAlign='left'
      >
        <Form.Item
          label={$t({ defaultMessage: 'DHCP Relay' })}
          children={transformDisplayOnOff(currentDhcp?.dhcpRelay ?? false)}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Domain Name' })}
          children={currentDhcp?.domainName || noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Primary DNS Server' })}
          children={currentDhcp?.primaryDnsIp || noDataDisplay}
        />
        {
          currentDhcp?.secondaryDnsIp &&
          <Form.Item
            label={$t({ defaultMessage: 'Secondary DNS Server' })}
            children={currentDhcp?.secondaryDnsIp || noDataDisplay}
          />
        }
        <Form.Item
          label={$t({ defaultMessage: 'Lease Time' })}
          children={currentDhcpStats?.leaseTime || noDataDisplay}
        />
        <Table
          rowKey='id'
          columns={columns}
          dataSource={currentDhcp?.dhcpPools}
          pagination={false}
        />
      </Form>
    </Loader>
  )

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'DHCP Details' })}
      </Button>
      <Drawer
        title={
          $t(
            { defaultMessage: 'DHCP Details : {profileName}' },
            { profileName: currentDhcp?.serviceName }
          )
        }
        visible={visible}
        onClose={onClose}
        children={content}
        width={'700px'}
      />
    </>
  )
}