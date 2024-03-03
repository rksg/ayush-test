import { useState } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { Button, PageHeader }                    from '@acx-ui/components'
import { MapSolid }                              from '@acx-ui/icons'
import { EdgeClusterTypeCard, SpaceWrapper }     from '@acx-ui/rc/components'
import { CommonCategory, Device, genUrl }        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export const SelectType = () => {
  const { $t } = useIntl()
  const { clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const typeCards = [{
    id: 'interface',
    title: $t({ defaultMessage: 'LAG, Port & Virtual IP Settings' }),
    icon: <MapSolid />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
      clusterId!,
      'configure',
      'interface'
    ])
  }, {
    id: 'subInterface',
    title: $t({ defaultMessage: 'Sub-interface Settings' }),
    icon: <MapSolid />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
      clusterId!,
      'configure',
      'subInterface'
    ])
  }, {
    id: 'clusterInterface',
    title: $t({ defaultMessage: 'Cluster Interface Settings' }),
    icon: <MapSolid />,
    targetUrl: genUrl([
      CommonCategory.Device,
      Device.EdgeCluster,
      clusterId!,
      'configure',
      'clusterInterface'
    ])
  }]

  const handleClickTypeCard = (val: string) => {
    setSelected(val)
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
          { clusterName: clusterId })}
        </Typography.Text>
      </Row>
      <Row>
        <SpaceWrapper fullWidth size={12} justifycontent='flex-start'>
          {typeCards.map(item => <EdgeClusterTypeCard
            key={item.id}
            id={item.id}
            title={item.title}
            icon={item.icon}
            showSelected={selected === item.id}
            onClick={handleClickTypeCard}
          />
          )}
        </SpaceWrapper>
      </Row>
      <Row>
        <Col span={24}>
          <UI.WarningTitle level={3}>
            {$t({ defaultMessage: 'Incompatible Hardware warning:' })}
          </UI.WarningTitle>
          <UI.WarningTxt>
            {
            // eslint-disable-next-line max-len
              $t({ defaultMessage: 'The number of CPU cores, memory, or physical ports on the SmartEdges do not meet the requirements for High Availability. \n'+
            // eslint-disable-next-line max-len
            'Please ensure the devices have matching specifications to establish a reliable HA configurations.' })}
          </UI.WarningTxt>
        </Col>
      </Row>
    </SpaceWrapper>
    <UI.ActionsContainer>
      <Button
        onClick={handleCacnel}
        children={$t({ defaultMessage: 'Cancel' })}
        style={{ marginRight: 'calc(50% - 70px - 35px)' }}
      />
      <Space align='center'>
        <Button
          type='primary'
          onClick={handleNext}
          disabled={!Boolean(selected)}
          children={$t({ defaultMessage: 'Next' })}
        />
      </Space>
    </UI.ActionsContainer>
  </>
}