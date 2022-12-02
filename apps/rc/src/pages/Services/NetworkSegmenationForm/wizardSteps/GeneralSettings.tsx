import React, {useEffect, useState} from 'react'

import { Form, Input, Row, Col, Select } from 'antd'
import { DefaultOptionType }             from 'antd/lib/select'
import { TiTick }                        from 'react-icons/ti'
import { defineMessage, useIntl }        from 'react-intl'

import { Alert, StepsForm }   from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'
import { useParams }          from '@acx-ui/react-router-dom'

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

  const waringMsg = defineMessage({
    id: 'waringMsg',
    // eslint-disable-next-line max-len
    defaultMessage: 'Please make sure you\'re done the following preparations before creating a Network Segmentation:' +
      '{br}' +
      // eslint-disable-next-line max-len
      '{TiTick} Already enabled the Property Management service for the venue where you want to apply' +
      '{br}' +
      '{TiTick} Already had an SmartEdge deployed in the venue where you want to apply'
  })

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
          {/* eslint-disable-next-line max-len */}
          <Alert message={intl.formatMessage(waringMsg, {
            p: (...chunks) => <p>{chunks}</p>,
            br: <br />,
            TiTick: <TiTick color='green'/>
          })}
          type='info' />

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
