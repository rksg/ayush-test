import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridCol, GridRow }               from '@acx-ui/components'
import { AccessControlInfoType, EnabledStatus } from '@acx-ui/rc/utils'

export default function AccessControlOverview (props: { data: AccessControlInfoType | undefined }) {
  const { $t } = useIntl()
  const { data } = props
  const { Paragraph } = Typography

  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Layer 2' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data && data.l2AclPolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF }
            </div>
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Layer 3' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data && data.l3AclPolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF }
            </div>
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Device & OS' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data && data.devicePolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF }
            </div>
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Applications' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data && data.applicationPolicy?.enabled ? EnabledStatus.ON : EnabledStatus.OFF }
            </div>
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Client Rate Limit' })}
          </Card.Title>
          <Paragraph>
            <div style={{ overflowWrap: 'anywhere' }}>
              {data && data.rateLimiting?.enabled ? EnabledStatus.ON : EnabledStatus.OFF }
            </div>
          </Paragraph>
        </GridCol>
      </GridRow>
    </Card>
  )
}
