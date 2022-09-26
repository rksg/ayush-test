
import { Row, Typography } from 'antd'
import { useIntl }         from 'react-intl'

import { Card } from '@acx-ui/components'

export default function DHCPOverView (props: { poolNumber:number | undefined }) {
  const { $t } = useIntl()

  return (
    <Row>
      <Card>
        <div>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Number of Pool' })}
          </Typography.Title>
          <Typography.Text>{props.poolNumber}</Typography.Text>
        </div>
      </Card>
    </Row>
  )
}

