import { Button, Col, Row } from 'antd'
import { useIntl }          from 'react-intl'

import { Card }               from '@acx-ui/components'
import { BiDirectionalArrow } from '@acx-ui/icons'
import { Link, Node }         from '@acx-ui/rc/utils'


export default function LinkTooltip (props: { tooltipPosition: {
    x: number,
    y: number
},
tooltipSourceNode: Node,
tooltipTargetNode: Node,
tooltipEdge: Link
}) {

  const { tooltipPosition, tooltipSourceNode, tooltipTargetNode, tooltipEdge } = props
  const { $t } = useIntl()

  return <div
    data-testid='edgeTooltip'
    style={{
      position: 'absolute',
      width: '280px',
      minHeight: '350px',
      zIndex: 9999,
      top: tooltipPosition.y - 100,
      left: tooltipPosition.x + 15
    }}>
    <Card
      type='no-border'
    >
      <Card.Title>
        {tooltipSourceNode?.type} <span><BiDirectionalArrow /></span> {tooltipTargetNode?.type}
      </Card.Title>
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          {tooltipSourceNode?.type}:
        </Col>
        <Col span={12} >
          <Button
            style={{
              padding: 0
            }}
            size='small'
            type='link'>
            {tooltipSourceNode?.name || tooltipSourceNode?.mac || tooltipSourceNode?.id}
          </Button>
        </Col>
      </Row>
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          {tooltipTargetNode?.type}:
        </Col>
        <Col span={12} >
          <Button
            style={{
              padding: 0
            }}
            size='small'
            type='link'>
            {tooltipTargetNode?.name || tooltipTargetNode?.mac || tooltipTargetNode?.id}
          </Button>
        </Col>
      </Row>
      <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          {$t({ defaultMessage: 'Link Speed' })}:
        </Col>
        <Col span={12} >
          {tooltipEdge?.linkSpeed || '--'}
        </Col>
      </Row>
      {
        /* TODO: does we get PoE usage if poe disabled?
        How to calculate and set unit for PoE? */
      }
      { !!(tooltipEdge?.poeUsed && tooltipEdge?.poeTotal) && <Row
        gutter={[12, 24]}
        style={{
          lineHeight: '24px'
        }}>
        <Col span={12} >
          {$t({ defaultMessage: 'PoE' })}:
        </Col>
        <Col span={12} >
          { tooltipEdge?.poeEnabled ? $t({ defaultMessage: 'On' })
            +'('+ tooltipEdge?.poeUsed +' / '+ tooltipEdge?.poeTotal +')'
            : $t({ defaultMessage: 'Off' })}
        </Col>
      </Row>
      }
      {
        <Row
          gutter={[12, 24]}
          style={{
            lineHeight: '24px'
          }}>
          <Col span={12} >
            {$t({ defaultMessage: 'Port' })}:
          </Col>
          <Col span={12} >
            { tooltipEdge?.connectedPort || '--'}
          </Col>
        </Row>
      }
    </Card>
  </div>
}