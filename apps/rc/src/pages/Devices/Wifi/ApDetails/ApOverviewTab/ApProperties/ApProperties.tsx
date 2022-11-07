import React from 'react'

import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'

import {
  Loader,
  Card
} from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export function ApProperties (props: { apDetailsQuery: any }) {
  const { $t } = useIntl()
  const { apDetailsQuery } = props

  const currentAP = apDetailsQuery.data

  return (
    <Loader states={[apDetailsQuery]}>
      <Card title={$t({ defaultMessage: 'AP Properties' })} onMoreClick={()=>{}}>
        <UI.Container>
          <Form.Item
            label={$t({ defaultMessage: 'Venue:' })}
            children={
              <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
                {currentAP?.venueName}
              </TenantLink>}
          />
          <Form.Item
            label={$t({ defaultMessage: 'AP Group:' })}
            children={currentAP?.deviceGroupName}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Description:' })}
            children={currentAP?.description}
          />
          <Divider/>
          <Form.Item
            label={$t({ defaultMessage: 'Uptime:' })}
            children={currentAP?.uptime}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Last Seen:' })}
            children={currentAP?.lastSeenTime}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Wireless Radio:' })}
            children={currentAP?.lastSeenTime}
          />
        </UI.Container>
      </Card>
    </Loader>
  )
}
