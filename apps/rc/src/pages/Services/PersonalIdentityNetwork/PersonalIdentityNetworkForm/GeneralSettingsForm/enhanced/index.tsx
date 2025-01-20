
import { useContext } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { useIntl }                       from 'react-intl'

import { StepsForm, useStepFormContext }                            from '@acx-ui/components'
import { PersonalIdentityNetworkFormData, servicePolicyNameRegExp } from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkFormContext } from '../../PersonalIdentityNetworkFormContext'
import { FieldTitle }                         from '../../styledComponents'

import { PropertyManagementInfo } from './PropertyManagementInfo'

export const EnhancedGeneralSettingsForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    venueOptions,
    isVenueOptionsLoading,
    setVenueId
  } = useContext(PersonalIdentityNetworkFormContext)
  const venueId = Form.useWatch('venueId', form)

  const onVenueChange = (value: string) => {
    setVenueId(value)
    form.setFieldsValue({
      edgeClusterId: undefined,
      dhcpId: undefined,
      poolId: undefined
    })
  }

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
                { max: 32 },
                { validator: (_, value) => servicePolicyNameRegExp(value) }
              ]}
              validateFirst
              hasFeedback
              children={<Input />}
            />
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={20}>
            <FieldTitle>
              {
                $t({
                // eslint-disable-next-line max-len
                  defaultMessage: 'Select the <VenueSingular></VenueSingular> where you want to apply PIN and ensure its property management is enabled.'
                })
              }
            </FieldTitle>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={20}>
            <Form.Item
              name='venueId'
              label={
                $t({ defaultMessage: '<VenueSingular></VenueSingular> with RUCKUS Edge deployed' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Please select a <VenueSingular></VenueSingular>' })
              }]}
              children={
                <Select
                  loading={isVenueOptionsLoading}
                  onChange={onVenueChange}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={venueOptions}
                  disabled={editMode}
                />
              }
            />
          </Col>
        </Row>

        { venueId &&
          <Row gutter={20}>
            <Col>
              <PropertyManagementInfo
                venueId={venueId}
                editMode={editMode}
              />
            </Col>
          </Row>}
      </Col>
    </Row>
  )
}