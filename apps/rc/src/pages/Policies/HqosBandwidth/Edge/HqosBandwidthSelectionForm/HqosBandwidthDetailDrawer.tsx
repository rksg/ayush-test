/* eslint-disable max-len */
import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps }                     from '@acx-ui/components'
import { CheckMark }                                                     from '@acx-ui/icons'
import { useGetEdgeHqosProfileByIdQuery }                                from '@acx-ui/rc/services'
import { TrafficClassSetting, priorityToDisplay, trafficClassToDisplay } from '@acx-ui/rc/utils'

interface HqosBandwidthDetailDrawerProps {
  hqosId?: string
}

export const HqosBandwidthDetailDrawer = (props: HqosBandwidthDetailDrawerProps) => {
  const { hqosId } = props
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)

  const { data: detailData, isLoading } = useGetEdgeHqosProfileByIdQuery(
    { params: { policyId: hqosId } },
    { skip: !hqosId }
  )

  const onClose = () => {
    setVisible(false)
  }

  const genBandwidthValue = (bandwidth?:number) => {
    return bandwidth ? bandwidth + ' %' : ''
  }

  const bandwidthColumns: TableProps<TrafficClassSetting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Traffic Class' }),
      key: 'trafficClass',
      dataIndex: 'trafficClass',
      width: 80,
      render: function (_, row) {
        return trafficClassToDisplay(row.trafficClass)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      width: 60,
      align: 'center',
      render: function (_, row) {
        return priorityToDisplay(row.priority)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority Scheduling' }),
      key: 'priorityScheduling',
      dataIndex: 'priorityScheduling',
      align: 'center',
      render: function (_, row) {
        return row.priorityScheduling?<CheckMark/>:''
      }
    },
    {
      title: $t({ defaultMessage: 'Guaranteed Bandwidth' }),
      key: 'minBandwidth',
      dataIndex: 'minBandwidth',
      align: 'center',
      render: function (_, row) {
        return <Space>{genBandwidthValue(row.minBandwidth)}</Space>
      }
    },
    {
      title: $t({ defaultMessage: 'Max Bandwidth' }),
      key: 'maxBandwidth',
      dataIndex: 'maxBandwidth',
      align: 'center',
      render: function (_, row) {
        return <Space>{genBandwidthValue(row.maxBandwidth)}</Space>
      }
    }
  ]

  const content = (
    <Loader states={[{
      isLoading: isLoading
    }]}>
      <Table
        rowKey={(row: TrafficClassSetting) => `${row.trafficClass}-${row.priority}`}
        columns={bandwidthColumns}
        dataSource={detailData?.trafficClassSettings}
        pagination={false}
      />
    </Loader>
  )

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)} data-testid='showHqosBandwidthDetailButton'>
        {$t({ defaultMessage: 'Profile Details' })}
      </Button>
      <Drawer
        title={$t({ defaultMessage: 'HQoS Bandwidth Profile Details : {profileName}' },{ profileName: detailData?.name })}
        visible={visible}
        onClose={onClose}
        children={content}
        width={'900px'}
      />
    </>
  )
}
