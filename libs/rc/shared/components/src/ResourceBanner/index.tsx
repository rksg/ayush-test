import { ReactNode } from 'react'

import { Col, Row, Typography } from 'antd'

import { cssStr } from '@acx-ui/components'


interface ResourceBannerProps {
  context: ReactNode | string,
}

export function ResourceBanner (props: ResourceBannerProps) {
  const { context } = props
  return (
    <Row>
      <Col span={24}
        style={{
          backgroundColor: cssStr('--acx-neutrals-15'),
          padding: '12px',
          borderRadius: '4px'
        }}>
        <Typography>
          {context}
        </Typography>
      </Col>
    </Row>
  )
}

