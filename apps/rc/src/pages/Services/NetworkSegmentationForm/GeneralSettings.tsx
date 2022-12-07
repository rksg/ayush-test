import React, { useEffect, useState } from 'react'


import { Form, Input, Row, Col, Select } from 'antd'
import { DefaultOptionType }             from 'antd/lib/select'
import { useIntl, FormattedMessage }     from 'react-intl'

import { Alert, StepsForm }     from '@acx-ui/components'
import { CheckMarkCircleSolid } from '@acx-ui/icons'
import { useVenuesListQuery }   from '@acx-ui/rc/services'
import { useParams }            from '@acx-ui/react-router-dom'


const defaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function GeneralSettings () {
  const intl = useIntl()

  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])

  const { tenantId } = useParams()

  const { data: venuesList, isLoading: isVenuesListLoading }
    = useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(venuesList?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const warningMsg = <FormattedMessage
    defaultMessage={
      // eslint-disable-next-line max-len
      'Please make sure you’ve done the following preparations before creating a Network Segmentation:' +
      '<br></br>' +
      // eslint-disable-next-line max-len
      '<icon></icon>Already enabled the Property Management service for the venue where you want to apply' +
      '<br></br>' +
      '<icon></icon>Already had an SmartEdge deployed in the venue where you want to apply'}

    values={{
      p: (...chunks) => <p>{chunks}</p>,
      br: () => <br />,
      icon: () => <CheckMarkCircleSolid style={{ color: 'green' }}/>
    }}
  />

  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <StepsForm.Title>{intl.$t({ defaultMessage: 'General Settings' })}</StepsForm.Title>
          <Form.Item
            name='name'
            label={intl.$t({ defaultMessage: 'Service Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          <Form.Item
            name='tags'
            label={intl.$t({ defaultMessage: 'Tags' })}
            children={<Input />}
          />
        </Col>
      </Row>

      <Row gutter={20}>
        <Col span={12}>
          <Alert message={warningMsg} type='info' />
        </Col>
      </Row>

      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            name='venueId'
            label={
              // eslint-disable-next-line max-len
              intl.$t({ defaultMessage: 'Select the Venue where you want to segment the devices (personas):' })
            }
            extra={intl.$t({
              defaultMessage: 'Venue with the property management enabled'
            })}
            initialValue={null}
            rules={[{
              required: true
            }]}
            children={<Select
              options={[
                { label: intl.$t({ defaultMessage: 'Select...' }), value: null },
                ...venueOption
              ]}
            />}
          />
        </Col>
      </Row>

    </>
  )
}
