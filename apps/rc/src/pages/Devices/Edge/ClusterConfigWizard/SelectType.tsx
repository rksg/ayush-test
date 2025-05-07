import { useContext, useEffect, useState } from 'react'

import { Col, Radio, RadioChangeEvent, Row, Space, Typography } from 'antd'
import { useIntl }                                              from 'react-intl'

import { Button, PageHeader, StepsForm, Tooltip } from '@acx-ui/components'
import { Features }                               from '@acx-ui/feature-toggle'
import { formatter }                              from '@acx-ui/formatter'
import {
  ClusterInterface as ClusterInterfaceIcon,
  Port as PortIcon,
  SubInterface as SubInterfaceIcon
} from '@acx-ui/icons'
import {
  ClusterConfigWizardSubtitle,
  EdgeClusterTypeCard,
  SpaceWrapper,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import { ClusterHighAvailabilityModeEnum, CommonCategory, Device, genUrl, validateEdgeGateway } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from './ClusterConfigWizardDataProvider'
import * as UI                        from './styledComponents'

export const SelectType = () => {
  const { $t } = useIntl()
  const { clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const { clusterInfo, clusterNetworkSettings } = useContext(ClusterConfigWizardContext)
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [hasGateway, setHasGateway] = useState(false)
  const isEdgeHaSubInterfaceReady = useIsEdgeFeatureReady(Features.EDGE_HA_SUB_INTERFACE_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  useEffect(() => {
    if(!clusterNetworkSettings?.portSettings) return
    const validateGateway = async () => {
      for(let i=0; i<clusterNetworkSettings.portSettings.length; i++) {
        const portSetting = clusterNetworkSettings.portSettings[i]
        const lagSetting = clusterNetworkSettings.lagSettings.find(item =>
          item.serialNumber === portSetting.serialNumber)
        try {
          await validateEdgeGateway(
            portSetting.ports,
            lagSetting?.lags ?? [],
            isDualWanEnabled
          )
        } catch (error) {
          break
        }
        if(i === clusterNetworkSettings.portSettings.length - 1) {
          setHasGateway(true)
        }
      }
    }
    validateGateway()
  }, [clusterNetworkSettings])

  const handleClickTypeCard = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  const handleCancel = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/devices/${Device.Edge}` })
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

  const isAaCluster = clusterInfo?.highAvailabilityMode ===
    ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
  const interfaceSettingTitle = isAaCluster ?
    (isEdgeCoreAccessSeparationReady ?
      $t({ defaultMessage: 'LAG, Port, Sub-Interface & HA Settings' }) :
      $t({ defaultMessage: 'LAG, Port, HA Settings' })) :
    (isEdgeCoreAccessSeparationReady ?
      $t({ defaultMessage: 'LAG, Port, Sub-Interface & Virtual IP Settings' }) :
      $t({ defaultMessage: 'LAG, Port & Virtual IP Settings' }))
  const typeCards = [{
    id: 'interface',
    title: interfaceSettingTitle,
    icon: <PortIcon />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
          clusterId!,
          'configure',
          'interface'
    ]),
    disabledList: [
      {
        value: !isHardwareCompatible
      }
    ]
  },
  ...(isEdgeHaSubInterfaceReady && !isEdgeCoreAccessSeparationReady ? [{
    id: 'subInterface',
    title: $t({ defaultMessage: 'Sub-interface Settings' }),
    icon: <SubInterfaceIcon />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
      clusterId!,
      'configure',
      'subInterface'
    ]),
    disabledList: [
      {
        value: !isHardwareCompatible
      },
      {
        value: !hasGateway,
        tooltip: $t({ defaultMessage: 'Please complete the LAG and port settings first' })
      }
    ]
  }] : []),
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
    ]),
    disabledList: [
      {
        value: !isHardwareCompatible
      },
      {
        value: !hasGateway,
        tooltip: $t({ defaultMessage: 'Please complete the LAG, Port & Virtual IP Settings first' })
      }
    ]
  }]

  const handleNext = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}${typeCards.filter(i => i.id === selected)[0].targetUrl}`
    })
  }

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Cluster & RUCKUS Edge Configuration Wizard' })}
      subTitle={<ClusterConfigWizardSubtitle clusterInfo={clusterInfo} />}
      breadcrumb={[
        { text: $t({ defaultMessage: 'RUCKUS Edges' }), link: '/devices/edge' }
      ]}
    />
    <SpaceWrapper fullWidth size={50} direction='vertical'>
      <Row>
        <Typography.Text>
          {$t({ defaultMessage: `Select which configuration you want to quickly set up for
      all RUCKUS Edges in this cluster:` },
          { clusterName })}
        </Typography.Text>
      </Row>
      <Radio.Group
        style={{ width: '100%' }}
        onChange={handleClickTypeCard}
        value={selected}
      >
        <Row gutter={[12, 0]}>
          {
            typeCards.map(item => {
              const disabled = item.disabledList.find(item => item.value)
              return <Col key={item.id}>
                {
                  disabled?.tooltip ?
                    <Tooltip title={disabled.tooltip}>
                      <div>
                        <EdgeClusterTypeCard
                          id={item.id}
                          title={item.title}
                          icon={item.icon}
                          disabled={disabled?.value}
                        />
                      </div>
                    </Tooltip>
                    :
                    <EdgeClusterTypeCard
                      id={item.id}
                      title={item.title}
                      icon={item.icon}
                      disabled={disabled?.value}
                    />
                }
              </Col>
            }
            )
          }
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
                $t({ defaultMessage: 'The number of CPU cores, memory, or physical ports on the RUCKUS Edges do not meet the requirements for High Availability. {br}'+
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
          onClick={handleCancel}
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