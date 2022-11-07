
import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card } from '@acx-ui/components'

export default function DHCPOverView (props: { poolNumber:number | undefined }) {
  const { $t } = useIntl()

  return (
    <Card title={$t({ defaultMessage: 'Number of Pools' })}>
      <div>
        <Typography.Text>{props.poolNumber}</Typography.Text>
      </div>
    </Card>
  )
}

