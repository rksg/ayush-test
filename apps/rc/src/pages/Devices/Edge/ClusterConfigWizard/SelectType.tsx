import { useContext, useState } from 'react'

import { Col, Radio, RadioChangeEvent, Row, Space, Typography } from 'antd'
import { useIntl }                                              from 'react-intl'

import { Button, PageHeader, StepsForm } from '@acx-ui/components'
import { formatter }                     from '@acx-ui/formatter'
import {
  ClusterInterface as ClusterInterfaceIcon,
  Port as PortIcon
} from '@acx-ui/icons'
import { EdgeClusterTypeCard, SpaceWrapper }     from '@acx-ui/rc/components'
import { CommonCategory, Device, genUrl }        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from './ClusterConfigWizardDataProvider'
import * as UI                        from './styledComponents'

export const SelectType = () => {
  const { $t } = useIntl()
  const { clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const typeCards = [{
    id: 'interface',
    title: $t({ defaultMessage: 'LAG, Port & Virtual IP Settings' }),
    icon: <PortIcon />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
      clusterId!,
      'configure',
      'interface'
    ])
  },
  // {
  //   id: 'subInterface',
  //   title: $t({ defaultMessage: 'Sub-interface Settings' }),
  //   icon: <SubInterfaceIcon />,
  //   targetUrl: genUrl([
  //     CommonCategory.Device,
  //     Device.EdgeCluster,
  //     clusterId!,
  //     'configure',
  //     'subInterface'
  //   ])
  // },
  {
    id: 'clusterInterface',
    title: $t({ defaultMessage: 'Cluster Interface Settings' }),
    icon: <ClusterInterfaceIcon />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
      clusterId!,
      'configure',
      'clusterInterface'
    ])
  }]

  const handleClickTypeCard = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  const handleCacnel = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/devices/${Device.Edge}` })
  }

  const handleNext = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}${typeCards.filter(i => i.id === selected)[0].targetUrl}`
    })
  }

  const clusterName = clusterInfo?.name
  const targetCpuCores = clusterInfo?.edgeList![0]?.cpuCores
  const targetMemoryInfo = formatter('bytesFormat')(
    (clusterInfo?.edgeList![0]?.memoryTotalKb ?? 0) * 1024)
    .split(' ')
  const [targetMemoryVal, targetMemoryUnit] = targetMemoryInfo
  const targetPorts = clusterInfo?.edgeList![0]?.ports

  const isHardwareCompatible = clusterInfo?.edgeList?.length === 0
    ? false
    : clusterInfo?.edgeList?.length === 1
      ? true
      : clusterInfo?.edgeList?.every(edge => {
        const memoryInfo = formatter('bytesFormat')(
          (edge.memoryTotalKb ?? 0) * 1024)
          .split(' ')
        const [memoryVal, memoryUnit] = memoryInfo
        return edge.cpuCores === targetCpuCores
            && edge.ports === targetPorts
            && memoryUnit === targetMemoryUnit
            && Math.ceil(+memoryVal) === Math.ceil(+targetMemoryVal)
      })

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Cluster & SmartEdge Configuration Wizard' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge' }
      ]}
    />
    <SpaceWrapper fullWidth size={50} direction='vertical'>
      <Row>
        <Typography.Text>
          {$t({ defaultMessage: `Select which configuration you want to quickly set up for
      all SmartEdges in this cluster ({clusterName}):` },
          { clusterName })}
        </Typography.Text>
      </Row>
      <Radio.Group
        style={{ width: '100%' }}
        onChange={handleClickTypeCard}
        value={selected}
      >
        <Row gutter={[12, 0]}>
          {typeCards.map(item => (
            <Col key={item.id}>
              <EdgeClusterTypeCard
                id={item.id}
                title={item.title}
                icon={item.icon}
                disabled={!isHardwareCompatible}
              />
            </Col>
          ))}
        </Row>
      </Radio.Group>
      {clusterInfo && !isHardwareCompatible &&
        <Row>
          <Col span={24}>
            <UI.WarningTitle level={3}>
              {$t({ defaultMessage: 'Incompatible Hardware warning:' })}
            </UI.WarningTitle>
            <UI.WarningTxt>
              {
              // eslint-disable-next-line max-len
                $t({ defaultMessage: 'The number of CPU cores, memory, or physical ports on the SmartEdges do not meet the requirements for High Availability. {br}'+
              // eslint-disable-next-line max-len
              'Please ensure the devices have matching specifications to establish a reliable HA configurations.' }, {
                  br: <br/>
                })}
            </UI.WarningTxt>
          </Col>
        </Row>
      }
    </SpaceWrapper>
    <StepsForm.ActionsContainer>
      <Space align='center' size={12}>
        <Button
          onClick={handleCacnel}
          children={$t({ defaultMessage: 'Cancel' })}
        />
        <Space align='center' size={12}>
          <Button
            type='primary'
            onClick={handleNext}
            disabled={!isHardwareCompatible || !Boolean(selected)}
            children={$t({ defaultMessage: 'Next' })}
          />
        </Space>
      </Space>
    </StepsForm.ActionsContainer>
  </>
}