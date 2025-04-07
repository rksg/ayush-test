import React from 'react'

import { Col, Row, Space, Table, TableProps } from 'antd'
import { useIntl }                            from 'react-intl'

import { Descriptions, StepsForm, Subtitle, useStepFormContext }         from '@acx-ui/components'
import { CheckMark }                                                     from '@acx-ui/icons'
import { SpaceWrapper }                                                  from '@acx-ui/rc/components'
import { TrafficClassSetting, priorityToDisplay, trafficClassToDisplay } from '@acx-ui/rc/utils'

import { HqosBandwidthFormModel } from '..'

import { StyledAntdDescriptions } from './styledComponents'

export const SummaryForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<HqosBandwidthFormModel>()
  const formValues = form.getFieldsValue(true)

  const getActivateEdgeClusterNames = () => {
    const result : string[] = []
    const activateChangedClusters = formValues.activateChangedClusters
    const activateChangedClustersInfo = formValues.activateChangedClustersInfo
    if(!activateChangedClusters){
      return result
    }

    const activateClusterIds = Object.keys(activateChangedClusters)
      .filter(k => activateChangedClusters[k] === true)
    activateClusterIds.forEach(clusterId => {
      result.push(activateChangedClustersInfo[clusterId]?.clusterName)
    })
    return result
  }
  const genBandwidthValue = (bandwidth?:number) => {
    return bandwidth !== undefined || bandwidth !== null ? bandwidth + ' %' : ''
  }

  const activateEdgeClusterNames = getActivateEdgeClusterNames()
  const clusterCount = activateEdgeClusterNames.length



  const bandwidthColumns: TableProps<TrafficClassSetting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Traffic Class' }),
      key: 'trafficClass',
      dataIndex: 'trafficClass',
      render: function (_, row) {
        return trafficClassToDisplay(row.trafficClass)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      render: function (_, row) {
        return priorityToDisplay(row.priority)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority Scheduling' }),
      key: 'priorityScheduling',
      dataIndex: 'priorityScheduling',render: function (_, row) {
        return row.priorityScheduling?<CheckMark/>:''
      }
    },
    {
      title: $t({ defaultMessage: 'Guaranteed Bandwidth' }),
      render: function (_, row) {
        return <Space>{genBandwidthValue(row.minBandwidth)}</Space>
      }
    },
    {
      title: $t({ defaultMessage: 'Max Bandwidth' }),
      render: function (_, row) {
        return <Space>{genBandwidthValue(row.maxBandwidth)}</Space>
      }
    }
  ]

  return (
    <Row gutter={[10, 30]}>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>

        <Subtitle level={4}>
          { $t({ defaultMessage: 'Settings' }) }
        </Subtitle>

        <Space direction='vertical' size={18}>
          <StyledAntdDescriptions layout='vertical' >
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Policy Name' })}
            >
              {formValues.name}
            </StyledAntdDescriptions.Item>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Description' })}
            >
              {formValues.description}
            </StyledAntdDescriptions.Item>
          </StyledAntdDescriptions>
        </Space>
      </Col>

      <Col span={24}>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'HQoS Bandwidth Control:' }) }
        </Subtitle>
        <Table
          rowKey={(row: TrafficClassSetting) => `${row.trafficClass}-${row.priority}`}
          columns={bandwidthColumns}
          dataSource={formValues?.trafficClassSettings}
          pagination={false}
        />
      </Col>

      <Col span={24}>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Clusters ({clusterCount})' }, { clusterCount }) }
        </Subtitle>
        <Descriptions>
          <Descriptions.NoLabel>
            <SpaceWrapper direction='vertical' size='small'>
              {activateEdgeClusterNames
                .map(clusterName => <React.Fragment key={clusterName}>
                  {clusterName}
                </React.Fragment>)}
            </SpaceWrapper>
          </Descriptions.NoLabel>
        </Descriptions>
      </Col>
    </Row>
  )
}
