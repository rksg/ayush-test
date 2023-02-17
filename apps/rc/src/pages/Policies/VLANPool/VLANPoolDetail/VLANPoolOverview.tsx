import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'
import { VLANPoolPolicyType }     from '@acx-ui/rc/utils'

export default function VLANPoolOverview (props: { vlanPoolProfile: VLANPoolPolicyType }) {
  const { $t } = useIntl()
  const { vlanPoolProfile } = props

  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Description' })}
          </Card.Title>
          <Typography.Text>{vlanPoolProfile.description?.toString()}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'VLANs' })}
          </Card.Title>
          <Typography.Text>{vlanPoolProfile.vlanMembers}</Typography.Text>
        </GridCol>
      </GridRow>
    </Card>
  )
}
