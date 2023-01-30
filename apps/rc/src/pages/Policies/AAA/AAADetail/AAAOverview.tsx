
import { Typography }                                from 'antd'
import { useIntl, MessageDescriptor, defineMessage } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'
import { AAAPolicyType }          from '@acx-ui/rc/utils'
const typeDescription: Record<string, MessageDescriptor> = {
  true: defineMessage({ defaultMessage: 'Accounting' }),
  false: defineMessage({ defaultMessage: 'Authentication' })
}
export default function AAAOverview (props: { aaaProfile: AAAPolicyType }) {
  const { $t } = useIntl()
  const { aaaProfile } = props
  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Tags' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.tags?.toString()}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Profile Type' })}
          </Card.Title>
          <Typography.Text>{$t(typeDescription[aaaProfile.isAuth+''])}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Primary Server Address' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.primary?.ip}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Primary Port' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.primary?.port}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Secondary Server Address' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.secondary?.ip}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Secondary Port' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.secondary?.port}</Typography.Text>
        </GridCol>
      </GridRow>
    </Card>
  )
}
