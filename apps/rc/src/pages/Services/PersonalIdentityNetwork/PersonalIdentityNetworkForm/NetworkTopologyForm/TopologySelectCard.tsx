import { ReactElement } from 'react'

import { Col, Row, Typography } from 'antd'

import { EdgeClusterTypeCard } from '@acx-ui/rc/components'

import { TopologySelectCardTitle } from './styledComponents'

interface TopologySelectCardProps {
  id: string
  diagram: ReactElement
  title: ReactElement | string
  disabled?: boolean
}

export const TopologySelectCard = (props: TopologySelectCardProps) => {
  const { id, diagram, title, disabled } = props

  return <Row gutter={[0, 20]} justify='center'>
    <Col span={24}>
      <EdgeClusterTypeCard
        id={id}
        title=''
        icon={diagram}
        width='100%'
        height='500px'
        disabled={disabled}
      />
    </Col>
    <Col>
      <Typography.Text strong>
        <TopologySelectCardTitle>{title}</TopologySelectCardTitle>
      </Typography.Text>
    </Col>
  </Row>
}