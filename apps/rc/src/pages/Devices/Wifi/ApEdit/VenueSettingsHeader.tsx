import { Col, Row, Space }           from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button }        from '@acx-ui/components'
import { VenueExtended } from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'


export function VenueSettingsHeader (props: {
  venue: VenueExtended,
  isUseVenueSettings: boolean,
  handleVenueSetting: () => void
}) {
  const { $t } = useIntl()
  const { venue, isUseVenueSettings, handleVenueSetting } = props

  return (
    <Row gutter={20}>
      <Col span={8}>
        <Space style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px',
          paddingBottom: '41px' }}
        >
          { isUseVenueSettings ?
            <FormattedMessage
              defaultMessage={`
              Currently settings as the venue (<venuelink></venuelink>)
            `}
              values={{
                venuelink: () => venue?
                  <TenantLink
                    to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
                  </TenantLink>: ''
              }}/>
            : $t({ defaultMessage: 'Custom settings' })
          }
        </Space>
      </Col>
      <Col span={8}>
        <Button type='link' onClick={handleVenueSetting}>
          {isUseVenueSettings ?
            $t({ defaultMessage: 'Customize' }):$t({ defaultMessage: 'Use Venue Settings' })
          }
        </Button>
      </Col>
    </Row>
  )
}

