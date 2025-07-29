import { Button, Space, Typography } from 'antd'
import { useIntl }                   from 'react-intl'

import { Card, Descriptions, GridCol, GridRow, Tabs }  from '@acx-ui/components'
import { BiDirectionalArrow, CloseSymbol }             from '@acx-ui/icons'
import { vlanPortsParser }                             from '@acx-ui/rc/switch/utils'
import { DeviceTypes, Link, LinkConnectionInfo, Node } from '@acx-ui/rc/utils'
import { useTenantLink }                               from '@acx-ui/react-router-dom'
import { noDataDisplay }                               from '@acx-ui/utils'

import * as UI from './styledComponents'

export default function LinkTooltip (props: { tooltipPosition: {
    x: number,
    y: number
},
tooltipSourceNode: Node,
tooltipTargetNode: Node,
tooltipEdge: Link,
onClose: () => void
}) {
  const { tooltipPosition, tooltipSourceNode, tooltipTargetNode, tooltipEdge, onClose } = props
  const { $t } = useIntl()
  const wifiBasePath = useTenantLink('/devices/wifi')
  const switchBasePath = useTenantLink('/devices/switch')

  const handleLink = (node: Node) => {
    let link
    if(node && node.type &&
      [DeviceTypes.Ap, DeviceTypes.ApMesh, DeviceTypes.ApMeshRoot, DeviceTypes.ApWired]
        .includes(node.type)) {
      link = `${wifiBasePath.pathname}/${node?.id || node?.serial}/details/overview`
    } else if (node && node.type &&
      [DeviceTypes.Switch, DeviceTypes.SwitchStack].includes(node.type)) {
      // eslint-disable-next-line max-len
      link = `${switchBasePath.pathname}/${node?.id || node?.serial}/${node?.serial}/details/overview`
    }
    return link
  }

  function VlansTrunked (props: {
    title: string
    tagged?: string
    untagged?: string
  }) {
    const { title, tagged, untagged } = props

    const untaggedVlanText = <Space size={4}>
      <UI.TagsOutlineIcon />{ (untagged && vlanPortsParser(untagged)) || '--' }
    </Space>

    const taggedVlanText = <Space size={4}>
      <UI.TagsSolidIcon />{ (tagged && vlanPortsParser(tagged)) || '--' }
    </Space>

    return <GridRow $divider>
      <GridCol col={{ span: 8 }}>
        {title}
      </GridCol>
      <GridCol col={{ span: 16 }}>
        <div>{untaggedVlanText}</div>
        <div>{taggedVlanText}</div>
      </GridCol>
    </GridRow>
  }

  function transformTitle (deviceType: DeviceTypes | undefined) {
    switch(deviceType) {
      case DeviceTypes.Ap:
      case DeviceTypes.ApMesh:
      case DeviceTypes.ApMeshRoot:
      case DeviceTypes.ApWired:
        return DeviceTypes.Ap.toUpperCase()
      case DeviceTypes.Switch:
      case DeviceTypes.SwitchStack:
        return DeviceTypes.Switch
    }
    return deviceType
  }

  function edgesInfoComponent (
    tooltipEdge: Link, tooltipSourceNode: Node, tooltipTargetNode: Node) {
    return <>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Link Speed' })}
        children={tooltipEdge?.linkSpeed || noDataDisplay} />
      {
        /* TODO: Do we still need to apply PoE usage if PoE is disabled?
        How do we calculate it and set the unit for PoE?*/
      }
      <Descriptions.Item
        label={tooltipEdge?.correspondingPort ?
          $t({ defaultMessage: 'From Port' }) : $t({ defaultMessage: 'Port' })}
        children={tooltipEdge?.connectedPort || noDataDisplay} />

      {tooltipEdge?.correspondingPort &&
          <Descriptions.Item
            label={$t({ defaultMessage: 'To Port' })}
            children={tooltipEdge?.correspondingPort || noDataDisplay} />
      }

      { !!(tooltipEdge?.poeUsed && tooltipEdge?.poeTotal) &&
          <Descriptions.Item
            label={$t({ defaultMessage: 'PoE' })}
            children={tooltipEdge?.poeEnabled ? $t({ defaultMessage: 'On' })
            +'('+ tooltipEdge?.poeUsed +' / '+ tooltipEdge?.poeTotal +')'
              : $t({ defaultMessage: 'Off' })} />
      }

      {(tooltipSourceNode?.type === DeviceTypes.Switch ||
        tooltipSourceNode?.type === DeviceTypes.SwitchStack)
        && (tooltipTargetNode?.type === DeviceTypes.Switch
          || tooltipTargetNode?.type === DeviceTypes.SwitchStack)
        && (tooltipEdge?.connectedPortTaggedVlan || tooltipEdge?.connectedPortUntaggedVlan
        || tooltipEdge?.correspondingPortTaggedVlan || tooltipEdge?.correspondingPortUntaggedVlan)
        &&
        <>
          <Descriptions.Item
            label={$t({ defaultMessage: 'VLANs trunked' })}
            children={null}
          />
          <Descriptions.Item
            children={
              <Card type='solid-bg'>
                <VlansTrunked
                  title={tooltipSourceNode.name}
                  untagged={tooltipEdge?.connectedPortUntaggedVlan}
                  tagged={tooltipEdge?.connectedPortTaggedVlan}
                />
                <VlansTrunked
                  title={tooltipTargetNode.name}
                  untagged={tooltipEdge?.correspondingPortUntaggedVlan}
                  tagged={tooltipEdge?.correspondingPortTaggedVlan}
                />
              </Card>}
          />
        </>
      }
    </>
  }

  return <div
    data-testid='edgeTooltip'
    style={{
      position: 'absolute',
      width: '348px',
      minHeight: '350px',
      zIndex: 9999,
      top: tooltipPosition?.y && typeof tooltipPosition?.y === 'number'
        ? tooltipPosition.y - 100 : 0,
      left: tooltipPosition?.x && typeof tooltipPosition?.x === 'number'
        ? tooltipPosition.x + 15 : 0
    }}>
    <Card>
      <Card.Title>
        <Space style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            {transformTitle(tooltipSourceNode?.type)} <span>
              <BiDirectionalArrow />&nbsp;</span>
            {transformTitle(tooltipTargetNode?.type)}
          </div>
          <Button
            size='small'
            type='link'
            onClick={onClose}
            icon={<CloseSymbol />}
            data-testid='closeLinkTooltip'/>
        </Space>
      </Card.Title>

      <Descriptions labelWidthPercent={50}
        style={{
          alignItems: 'center'
        }}>
        <Descriptions.Item
          label={transformTitle(tooltipSourceNode?.type)}
          children={
            <Typography.Link
              style={{
                width: '156px'
              }}
              ellipsis={true}
              href={handleLink(tooltipSourceNode)}>
              {tooltipSourceNode?.name || tooltipSourceNode?.mac || tooltipSourceNode?.id}
            </Typography.Link>
          } />

        <Descriptions.Item
          label={transformTitle(tooltipTargetNode?.type)}
          children={
            <Typography.Link
              style={{
                width: '156px'
              }}
              ellipsis={true}
              href={handleLink(tooltipTargetNode)}>
              {tooltipTargetNode?.name || tooltipTargetNode?.mac || tooltipTargetNode?.id}
            </Typography.Link>
          } />
        {!tooltipEdge?.extraEdges &&
            edgesInfoComponent(tooltipEdge, tooltipSourceNode, tooltipTargetNode)}
      </Descriptions>
      {tooltipEdge?.extraEdges && tooltipEdge?.extraEdges.length > 0 &&
        <Tabs type='third' defaultActiveKey={'#1'} centered>
          <Tabs.TabPane
            tab={$t({ defaultMessage: '#1' })}
            key='#1'>
            <Descriptions>
              {edgesInfoComponent(tooltipEdge, tooltipSourceNode, tooltipTargetNode)}
            </Descriptions>
          </Tabs.TabPane>
          {tooltipEdge.extraEdges.map((item: LinkConnectionInfo, index: number) =>
            <Tabs.TabPane
              tab={`#${index+2}`}
              key={`#${index+2}`}>
              <Descriptions>
                {edgesInfoComponent(item as Link, tooltipSourceNode, tooltipTargetNode)}
              </Descriptions>
            </Tabs.TabPane>
          )}
        </Tabs>
      }
    </Card>
  </div>
}