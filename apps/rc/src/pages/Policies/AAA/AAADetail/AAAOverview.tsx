
import { Typography }                                from 'antd'
import { useIntl, MessageDescriptor, defineMessage } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'
import { AAAPolicyType }          from '@acx-ui/rc/utils'
const typeDescription: Record<string, MessageDescriptor> = {
  AUTHENTICATION: defineMessage({ defaultMessage: 'Authentication' }),
  ACCOUNTING: defineMessage({ defaultMessage: 'Accounting' })
}
export default function AAAOverview (props: { aaaProfile: AAAPolicyType }) {
  const { $t } = useIntl()
  const { aaaProfile } = props
  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Profile Type' })}
          </Card.Title>
          <Typography.Text>{$t(typeDescription[aaaProfile.type+''])}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Primary IP Address' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.primary?.ip}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Primary Port' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.primary?.port}</Typography.Text>
        </GridCol>
        {aaaProfile.secondary && <>
          <GridCol col={{ span: 6 }}>
            <Card.Title>
              {$t({ defaultMessage: 'Secondary IP Address' })}
            </Card.Title>
            <Typography.Text>{aaaProfile.secondary?.ip}</Typography.Text>
          </GridCol>
          <GridCol col={{ span: 4 }}>
            <Card.Title>
              {$t({ defaultMessage: 'Secondary Port' })}
            </Card.Title>
            <Typography.Text>{aaaProfile.secondary?.port}</Typography.Text>
          </GridCol></>}
      </GridRow>
    </Card>
  )
}
