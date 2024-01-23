
import { useState } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { FormattedMessage, useIntl }     from 'react-intl'

import { Alert, StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { useVenuesListQuery }                            from '@acx-ui/rc/services'

import { NetworkSegmentationGroupFormData } from '..'
import * as UI                              from '../styledComponents'

import { PersonalIdentityPreparationListDrawer } from './PersonalIdentityPreparationListDrawer'
import { PropertyManagementInfo }                from './PropertyManagementInfo'
import { AlertCheckMarkIcon, Sub5Bold }          from './styledComponents'

interface GeneralSettingsFormProps {
  editMode?: boolean
}

const venueOptionsDefaultPayload = {
  fields: [
    'name',
    'id',
    'switches'
  ],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const GeneralSettingsForm = (props: GeneralSettingsFormProps) => {
  const [openDrawer,setOpenDrawer] = useState(true)
  const { editMode } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const venueId = Form.useWatch('venueId', form)
  const {
    venueOptions = [],
    isVenueOptionsLoading
  } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
          isVenueOptionsLoading: isLoading
        }
      }
    })

  const onVenueChange = (value: string) => {
    const venueItem = venueOptions?.find(item => item.value === value)
    form.setFieldsValue({
      venueName: venueItem?.label,
      edgeId: undefined,
      edgeName: undefined,
      dhcpId: undefined,
      dhcpName: undefined,
      poolId: undefined,
      poolName: undefined
    })
  }

  const warningMsg = <FormattedMessage
    defaultMessage={
      // eslint-disable-next-line max-len
      'Please make sure you’ve done the following preparations before creating a Personal Identity Network:' +
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
    <Row>
      <Col span={10}>
        <Row gutter={20}>
          <Col span={20}>
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
          <Col>
            <Alert message={warningMsg} type='info' />
          </Col>
        </Row>
        <Row gutter={20}>
          <Col>
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
          <Col span={20}>
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
          venueId && <Row gutter={20}>
            <Col>
              <PropertyManagementInfo
                venueId={venueId}
                editMode={editMode}
              />
            </Col>
          </Row>
        }
      </Col>
      <PersonalIdentityPreparationListDrawer open={openDrawer}
        onClose={()=>setOpenDrawer(false)}
      />
    </Row>
  )
}
