
import { useEffect } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { FormattedMessage, useIntl }     from 'react-intl'

import { Alert, StepsForm, Tooltip, useStepFormContext }                   from '@acx-ui/components'
import { useGetPropertyConfigsQuery, useGetQueriablePropertyConfigsQuery } from '@acx-ui/rc/services'

import { NetworkSegmentationGroupFormData } from '..'
import * as UI                              from '../styledComponents'

import { PersonaGroupTable }            from './PersonaGroupTable'
import { AlertCheckMarkIcon, Sub5Bold } from './styledComponents'

interface GeneralSettingsFormProps {
  editMode?: boolean
}

const venueOptionsDefaultPayload = {
  sortField: 'venueName',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 100
}

export const GeneralSettingsForm = (props: GeneralSettingsFormProps) => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const venueId = Form.useWatch('venueId', form)
  const { venueOptions, isVenueOptionsLoading } = useGetQueriablePropertyConfigsQuery({
    payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.venueName, value: item.venueId })),
        isVenueOptionsLoading: isLoading
      }
    }
  })
  const { personaGroupId } = useGetPropertyConfigsQuery(
    { params: { venueId } },
    {
      skip: !!!venueId,
      selectFromResult: ({ data }) => {
        return {
          personaGroupId: data?.personaGroupId
        }
      }
    }
  )

  useEffect(() => {
    if(personaGroupId) {
      form.setFieldValue('personaGroupId', personaGroupId)
    }
  }, [personaGroupId])

  const onVenueChange = (value: string) => {
    const venueItem = venueOptions?.find(item => item.value === value)
    form.setFieldValue('venueName', venueItem?.label)
    form.setFieldValue('edgeId', null)
    form.setFieldValue('edgeId', null)
    form.setFieldValue('edgeName', null)
    form.setFieldValue('dhcpId', null)
    form.setFieldValue('dhcpName', null)
    form.setFieldValue('poolId', null)
    form.setFieldValue('poolName', null)
  }

  const warningMsg = <FormattedMessage
    defaultMessage={
      // eslint-disable-next-line max-len
      'Please make sure you’ve done the following preparations before creating a Network Segmentation:' +
      '<br></br><br></br>' +
      // eslint-disable-next-line max-len
      '<icon></icon>Already enabled the <sub5b>Property Management</sub5b> service for the venue where you want to apply' +
      '<br></br>' +
      // eslint-disable-next-line max-len
      '<icon></icon>Already had an <sub5b>SmartEdge</sub5b> deployed in the venue where you want to apply'}

    values={{
      br: () => <br />,
      icon: () => <AlertCheckMarkIcon />,
      sub5b: (content) => <Sub5Bold >{content}</Sub5Bold>
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
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={12}>
          <Alert message={warningMsg} type='info' />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={12}>
          <UI.FieldTitle>
            {
              $t({
                // eslint-disable-next-line max-len
                defaultMessage: 'Select the Venue where you want to segment the devices (identities):'
              })
            }
          </UI.FieldTitle>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            name='venueId'
            label={
              <>
                {$t({ defaultMessage: 'Venue with the property management enabled' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: `To enable the property management for a venue,
                    please go to the Venue configuration/property management page to enable it.` })}
                  placement='bottom'
                />
              </>
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select a Venue' })
            }]}
            children={
              <Select
                loading={isVenueOptionsLoading}
                onChange={onVenueChange}
                placeholder={$t({ defaultMessage: 'Select...' })}
                options={venueOptions}
                disabled={props.editMode}
              />
            }
          />
        </Col>
      </Row>
      {
        personaGroupId && <Row gutter={20}>
          <Col span={10}>
            <PersonaGroupTable personaGroupId={personaGroupId} />
          </Col>
        </Row>
      }
    </>
  )
}
