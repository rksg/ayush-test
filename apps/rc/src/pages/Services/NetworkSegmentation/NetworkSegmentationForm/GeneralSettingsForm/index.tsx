
import { Col, Form, Input, Row, Select } from 'antd'
import { FormattedMessage, useIntl }     from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Alert, StepsForm, useStepFormContext } from '@acx-ui/components'
import { CheckMarkCircleSolid }                 from '@acx-ui/icons'
import { useVenuesListQuery }                   from '@acx-ui/rc/services'

import { NetworkSegmentationGroupForm } from '..'
import { useWatch }                     from '../../useWatch'
import * as UI                          from '../styledComponents'

import { VenueTable } from './VenueTable'

interface GeneralSettingsFormProps {
  editMode?: boolean
}

const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const GeneralSettingsForm = (props: GeneralSettingsFormProps) => {

  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()
  const venue = useWatch('venueId', form)
  const { venueOptions, isLoading: isVenueOptionsLoading } = useVenuesListQuery(
    { params: { tenantId: tenantId }, payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
          isLoading
        }
      }
    })

  const onVenueChange = (value: string) => {
    const venueItem = venueOptions?.find(item => item.value === value)
    form.setFieldValue('venueName', venueItem?.label)
  }

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
          <StepsForm.Title>{$t({ defaultMessage: 'General Settings' })}</StepsForm.Title>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Service Name' })}
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
            label={$t({ defaultMessage: 'Tags' })}
            children={<Select mode='tags' />}
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
          <UI.FieldTitle>
            {
              $t({
                defaultMessage: 'Select the Venue where you want to segment the devices (personas):'
              })
            }
          </UI.FieldTitle>
          <Form.Item
            name='venueId'
            label={
            // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Venue with the property management enabled' })
            }
            rules={[{
              required: true
            }]}
            children={
              <Select
                loading={Boolean(isVenueOptionsLoading)}
                onChange={onVenueChange}
                options={[
                  { label: $t({ defaultMessage: 'Select...' }), value: null },
                  ...(venueOptions || [])
                ]}
                disabled={props.editMode}
              />
            }
          />
        </Col>
      </Row>
      {venue && <Row gutter={20}>
        <Col span={10}>
          <VenueTable />
        </Col>
      </Row>}
    </>
  )
}
