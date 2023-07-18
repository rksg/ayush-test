import { Button, Space, Typography } from 'antd'
import { useIntl }                   from 'react-intl'

import { Card, Descriptions }              from '@acx-ui/components'
import { BiDirectionalArrow, CloseSymbol } from '@acx-ui/icons'
import { Link, Node }                      from '@acx-ui/rc/utils'
import { noDataDisplay }                   from '@acx-ui/utils'


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

  return <div
    data-testid='edgeTooltip'
    style={{
      position: 'absolute',
      width: '348px',
      minHeight: '350px',
      zIndex: 9999,
      top: tooltipPosition.y - 100,
      left: tooltipPosition.x + 15
    }}>
    <Card
      type='no-border'
    >
      <Card.Title>
        <Space style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            {tooltipSourceNode?.type} <span><BiDirectionalArrow /></span> {tooltipTargetNode?.type}
          </div>
          <Button size='small' type='link' onClick={onClose} icon={<CloseSymbol />}/>
        </Space>
      </Card.Title>

      <Descriptions labelWidthPercent={50}
        style={{
          alignItems: 'center'
        }}>
        <Descriptions.Item
          label={tooltipSourceNode?.type}
          children={
            <Typography.Link
              style={{
                width: '156px'
              }}
              ellipsis={true}>
              {tooltipSourceNode?.name || tooltipSourceNode?.mac || tooltipSourceNode?.id}
            </Typography.Link>
          } />

        <Descriptions.Item
          label={tooltipTargetNode?.type}
          children={
            <Typography.Link
              style={{
                width: '156px'
              }}
              ellipsis={true}>
              {tooltipTargetNode?.name || tooltipTargetNode?.mac || tooltipTargetNode?.id}
            </Typography.Link>
          } />

        <Descriptions.Item
          label={$t({ defaultMessage: 'Link Speed' })}
          children={tooltipEdge?.linkSpeed || noDataDisplay} />

        {
          /* TODO: does we get PoE usage if poe disabled?
          How to calculate and set unit for PoE? */
        }

        { !!(tooltipEdge?.poeUsed && tooltipEdge?.poeTotal) &&
          <Descriptions.Item
            label={$t({ defaultMessage: 'PoE' })}
            children={tooltipEdge?.poeEnabled ? $t({ defaultMessage: 'On' })
            +'('+ tooltipEdge?.poeUsed +' / '+ tooltipEdge?.poeTotal +')'
              : $t({ defaultMessage: 'Off' })} />
        }

        <Descriptions.Item
          label={$t({ defaultMessage: 'Port' })}
          children={tooltipEdge?.connectedPort || noDataDisplay} />
      </Descriptions>
    </Card>
  </div>
}