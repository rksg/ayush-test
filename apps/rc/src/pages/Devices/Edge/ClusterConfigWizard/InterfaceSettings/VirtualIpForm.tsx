import { useContext } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { Loader }                                    from '@acx-ui/components'
import { EdgeClusterVirtualIpSettingForm, TypeForm } from '@acx-ui/rc/components'
import { useGetAllInterfacesByTypeQuery }            from '@acx-ui/rc/services'
import { EdgePortTypeEnum }                          from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { interfaceNameComparator } from './utils'

export const VirtualIpForm = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const {
    data: lanInterfaces,
    isLoading: isLanInterfacesLoading
  } = useGetAllInterfacesByTypeQuery({
    payload: {
      edgeIds: clusterInfo?.edgeList?.map(node => node.serialNumber),
      portTypes: [EdgePortTypeEnum.LAN]
    }
  }, {
    skip: (!clusterInfo?.edgeList || clusterInfo?.edgeList.length === 0),
    selectFromResult: ({ data, ...rest }) => ({
      data: data ? Object.fromEntries(
        Object.entries(data)
          .map(([key, interfaces]) => [
            key,
            interfaces.slice().sort(interfaceNameComparator)
          ])) : undefined,
      ...rest
    })
  })

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Cluster Virtual IP' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Please select the interfaces for RUCKUS Edges 
      and assign virtual IPs for seamless failover:` })}
    </Typography.Text>
  </Space>

  const content = <Row>
    <Col span={14}>
      <EdgeClusterVirtualIpSettingForm
        currentClusterStatus={clusterInfo}
        lanInterfaces={lanInterfaces}
      />
    </Col>
  </Row>

  return (
    <Loader states={[{ isLoading: false, isFetching: isLanInterfacesLoading }]}>
      <TypeForm
        header={header}
        content={content}
      />
    </Loader>
  )
}
