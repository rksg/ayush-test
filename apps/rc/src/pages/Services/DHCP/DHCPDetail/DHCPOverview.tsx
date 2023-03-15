
import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridRow, GridCol }                     from '@acx-ui/components'
import { DHCPConfigTypeEnum, DHCPConfigTypeMessages } from '@acx-ui/rc/utils'

export default function DHCPOverView (props: { poolNumber:number | undefined,
  configureType: DHCPConfigTypeEnum | undefined }) {
  const { $t } = useIntl()

  return (
    <Card type='solid-bg'>
      <GridRow justify='start'>
        <GridCol col={{ span: 3 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Number of Pools' })}
          </Card.Title>
          <Typography.Text>{props.poolNumber}</Typography.Text>
        </GridCol>

        <GridCol col={{ span: 3 }}>
          <Card.Title>
            {$t({ defaultMessage: 'DHCP Configuration' })}
          </Card.Title>
          <Typography.Text>
            { props.configureType ? $t(DHCPConfigTypeMessages[props.configureType]):'' }
          </Typography.Text>
        </GridCol>
      </GridRow>
    </Card>
  )
}

