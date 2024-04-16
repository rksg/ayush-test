
import { useContext, useEffect, useState } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { FormattedMessage, useIntl }     from 'react-intl'

import { Alert, Button, StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { useGetNetworkSegmentationViewDataListQuery }            from '@acx-ui/rc/services'

import { PersonalIdentityNetworkFormData }    from '..'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'
import * as UI                                from '../styledComponents'

import { PersonalIdentityDiagram }               from './PersonalIdentityDiagram'
import { PersonalIdentityPreparationListDrawer } from './PersonalIdentityPreparationListDrawer'
import { PropertyManagementInfo }                from './PropertyManagementInfo'

interface GeneralSettingsFormProps {
  editMode?: boolean
}

export const GeneralSettingsForm = (props: GeneralSettingsFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const [preparationDrawerVisible,setPreparationDrawerVisible] = useState(false)
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    venueOptions,
    isVenueOptionsLoading,
    setVenueId,
    switchList
  } = useContext(PersonalIdentityNetworkFormContext)
  const venueId = Form.useWatch('venueId', form)
  const { data: pinData } = useGetNetworkSegmentationViewDataListQuery({
    payload: { fields: ['id'] }
  })

  useEffect(() => {
    if(pinData && pinData.totalCount < 1) setPreparationDrawerVisible(true)
  }, [pinData])

  const onVenueChange = (value: string) => {
    setVenueId(value)
    form.setFieldsValue({
      edgeId: undefined,
      dhcpId: undefined,
      poolId: undefined
    })
  }

  const warningMsg = <FormattedMessage
    defaultMessage={`Please ensure that you understand the necessary
    {btn} before creating a network segmentation.`}
    values={{
      btn: <Button type='link' size='small' onClick={() => setPreparationDrawerVisible(true)}>{
        $t({ defaultMessage: 'preparations' })}
      </Button>
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
          <Col span={20}>
            <Alert message={warningMsg} type='info' showIcon />
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={20}>
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
                <>{/* eslint-disable-next-line max-len */}
                  {$t({ defaultMessage: '<VenueSingular></VenueSingular> with SmartEdge deployed' })}
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
          venueId &&
          <Row gutter={20}>
            <Col>
              <PropertyManagementInfo
                venueId={venueId}
                editMode={editMode}
              />
            </Col>
          </Row>
        }
      </Col>
      {
        venueId &&
        <Col span={14}>
          <PersonalIdentityDiagram hasSwitch={(switchList?.length ?? 0) > 0} />
        </Col>
      }
      <PersonalIdentityPreparationListDrawer open={preparationDrawerVisible}
        onClose={()=>setPreparationDrawerVisible(false)}
      />
    </Row>
  )
}
