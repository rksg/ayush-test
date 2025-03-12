import { Col, Row, Space }           from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button }        from '@acx-ui/components'
import { VenueExtended } from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'


export function VenueSettingsHeader (props: {
  venue: VenueExtended | undefined,
  isUseVenueSettings: boolean,
  handleVenueSetting: () => void,
  disabled?: boolean
}) {
  const { $t } = useIntl()
  const { venue, isUseVenueSettings, handleVenueSetting, disabled } = props

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
              Currently settings as the <venueSingular></venueSingular> (<venuelink></venuelink>)
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
        <Button type='link' disabled={disabled} onClick={handleVenueSetting}>
          {isUseVenueSettings ?
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Customize' }):$t({ defaultMessage: 'Use <VenueSingular></VenueSingular> Settings' })
          }
        </Button>
      </Col>
    </Row>
  )
}

