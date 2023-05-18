import React, { useContext } from 'react'

import {
  Col,
  Form,
  Input,
  Row,
  Typography
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { StepsFormLegacy } from '@acx-ui/components'
import {
  useLazyVenuesListQuery,
  useGetVenueQuery
} from '@acx-ui/rc/services'
import {
  Address,
  MigrationActionTypes,
  checkObjectNotExists
} from '@acx-ui/rc/utils'

import MigrationContext from '../MigrationContext'

import * as UI from './styledComponents'

export const defaultAddress: Address = {
  addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  city: 'Sunnyvale, California',
  country: 'United States',
  latitude: 37.4112751,
  longitude: -122.0191908,
  timezone: 'America/Los_Angeles'
}

type MigrationSettingFormProps = {
  className?: string
}

const MigrationSettingForm = styled((props: MigrationSettingFormProps) => {
  const { $t } = useIntl()
  const { className } = props
  const params = useParams()

  const {
    state, dispatch
  } = useContext(MigrationContext)

  const { tenantId, venueId } = useParams()
  const { data } = useGetVenueQuery({ params: { tenantId, venueId } }, { skip: !venueId })
  const venuesListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [venuesList] = useLazyVenuesListQuery()
  const nameValidator = async (value: string) => {
    const payload = { ...venuesListPayload, searchString: value }
    const list = (await venuesList({ params, payload }, true)
      .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Venue' }))
  }

  const handleVenueName = (venueName: string) => {
    dispatch({
      type: MigrationActionTypes.VENUENAME,
      payload: {
        venueName: venueName
      }
    })
  }

  const handleDescription = (description: string) => {
    dispatch({
      type: MigrationActionTypes.DESCRIPTION,
      payload: {
        description: description
      }
    })
  }

  const handleAddress = (address: string) => {
    dispatch({
      type: MigrationActionTypes.ADDRESS,
      payload: {
        address: address
      }
    })
  }

  return (
    <Row gutter={20} className={className}>
      <Col span={10}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Migration' })}</StepsFormLegacy.Title>
        <Typography.Text>
          {// eslint-disable-next-line max-len
            $t({ defaultMessage: 'Migration assistant will migrate ZoneDirector configuration from the selected backup file and create a new venue.' })}
        </Typography.Text>
        <Form.Item
          name='venueName'
          label={$t({ defaultMessage: 'New Venue Name' })}
          rules={[
            { min: 2 },
            { max: 32 },
            {
              validator: (_, value) => nameValidator(value)
            }
          ]}
          validateFirst
          hasFeedback
          initialValue={state.venueName}
          children={<Input
            data-testid='name'
            style={{ width: '380px' }}
            onChange={(event => {handleVenueName(event.target.value)})}
          />}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          children={<Input
            data-testid='test-description'
            style={{ width: '380px' }}
            onChange={(event => {handleDescription(event.target.value)})}
          />}
        />
        <Form.Item
          name='address'
          label={$t({ defaultMessage: 'Address' })}
          children={<Input
            data-testid='address'
            style={{ width: '380px' }}
            onChange={(event => {handleAddress(event.target.value)})}
          />}
        />
        <Typography.Text>
          {$t({ defaultMessage: 'Note: WLAN configuration won’t be migrated' })}
        </Typography.Text>
      </Col>
    </Row>
  )
})`${UI.styles}`

export { MigrationSettingForm }
