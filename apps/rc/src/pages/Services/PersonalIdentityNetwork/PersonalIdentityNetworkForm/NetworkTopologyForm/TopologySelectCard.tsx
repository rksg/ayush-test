import { ReactElement } from 'react'

import { Col, Row } from 'antd'

import { EdgeClusterTypeCard } from '@acx-ui/rc/components'

import { TopologySelectCardTitle } from './styledComponents'

interface TopologySelectCardProps {
  id: string
  diagram: ReactElement
  title: ReactElement | string
  isActive: boolean
  disabled?: boolean
}

export const TopologySelectCard = (props: TopologySelectCardProps) => {
  const { id, diagram, title, isActive, disabled } = props

  return <Row gutter={[0, 20]} justify='center'>
    <Col span={24}>
      <TopologySelectCardTitle strong={isActive}>
        {title}
      </TopologySelectCardTitle>
      <EdgeClusterTypeCard
        id={id}
        title=''
        icon={diagram}
        width='100%'
        height='500px'
        disabled={disabled}
      />
    </Col>
  </Row>
}