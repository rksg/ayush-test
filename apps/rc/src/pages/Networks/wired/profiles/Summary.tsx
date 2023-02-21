import { useContext } from 'react'

import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'


import { StepsForm }          from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'
import { Venue }              from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'

import { ConfigurationProfileFormContext } from './ConfigurationProfileFormContext'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export function Summary () {
  const { $t } = useIntl()
  const params = useParams()
  const { currentData } = useContext(ConfigurationProfileFormContext)

  const { data } = useVenuesListQuery({ params:
    { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' }, payload: defaultPayload })

  const venueList = data?.data.reduce<Record<Venue['id'], Venue>>((map, obj) => {
    map[obj.id] = obj
    return map
  }, {})

  const getVenues = function () {
    const venues = currentData.venues
    const rows = []
    if (venues && venues.length > 0) {
      for (const venue of venues) {
        const venueId = venue || ''
        rows.push(
          venueList && venueList[venueId] ? venueList[venueId].name : venueId
        )
      }
    }
    return rows.join(', ')
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title
          children={$t({ defaultMessage: 'Summary' })}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Profile Name:' })}
          children={currentData.name}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description:' })}
          children={currentData.description || $t({ defaultMessage: 'None' })}
        />
        <Form.Item
          label={$t({ defaultMessage: 'VLANs:' })}
          children={(currentData.vlans && currentData.vlans.length > 0 &&
            currentData.vlans.map((item) => { return item.vlanId }).join(', ')) ||
            $t({ defaultMessage: 'None' })}
        />
        <Form.Item
          label={$t({ defaultMessage: 'ACLs:' })}
          children={(currentData.acls && currentData.acls.length > 0 &&
            currentData.acls.map((item) => { return item.name }).join(', ')) ||
            $t({ defaultMessage: 'None' })}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Venues:' }) || $t({ defaultMessage: 'None' })}
          children={getVenues() || $t({ defaultMessage: 'None' })}
        />
      </Col>
    </Row>
  )
}