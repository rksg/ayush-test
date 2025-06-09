import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { CrossCircleSolidIcon } from '@acx-ui/icons'
import { StatusReason }         from '@acx-ui/rc/utils'

export function PublishedTooltipContent (props: { reasons: StatusReason[] }) {

  const { $t } = useIntl()
  const { reasons } = props
  return <>
    <Typography.Title level={4}
      style={{
        color: 'var(--acx-primary-white)'
      }}>
      { $t({ defaultMessage: 'Publish Readiness' }) }</Typography.Title>
    {reasons?.map(reason => <Row gutter={16}>
      <Col span={3}><CrossCircleSolidIcon /></Col>
      <Col span={21}>
        { reason.statusReason }</Col>
    </Row>)}</>
}