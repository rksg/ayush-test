
import { useContext } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { useIntl }                       from 'react-intl'

import { StepsForm, useStepFormContext }                            from '@acx-ui/components'
import { Features }                                                 from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                    from '@acx-ui/rc/components'
import { PersonalIdentityNetworkFormData, servicePolicyNameRegExp } from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkFormContext } from '../../PersonalIdentityNetworkFormContext'
import { FieldTitle }                         from '../../styledComponents'

import { PropertyManagementInfo } from './PropertyManagementInfo'

export const EnhancedGeneralSettingsForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const isL2GreEnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const {
    venueOptions,
    isVenueOptionsLoading,
    tunnelProfileOptions,
    isTunnelLoading,
    setVenueId,
    getClusterInfoByTunnelProfileId
  } = useContext(PersonalIdentityNetworkFormContext)
  const venueId = Form.useWatch('venueId', form) || form.getFieldValue('venueId')

  const onVenueChange = (value: string) => {
    setVenueId(value)
    form.setFieldsValue({
      edgeClusterId: undefined,
      dhcpId: undefined,
      poolId: undefined
    })
  }

  const onTunnelProfileChange = (value: string) => {
    // eslint-disable-next-line max-len
    const clusterInfo = getClusterInfoByTunnelProfileId(value)
    setVenueId(clusterInfo?.venueId ?? '')
    form.setFieldsValue({
      venueId: clusterInfo?.venueId,
      edgeClusterId: clusterInfo?.clusterId,
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
        {
          isL2GreEnabled ?
            <Row gutter={20}>
              <Col span={20}>
                <Form.Item
                  name='vxlanTunnelProfileId'
                  label={$t({ defaultMessage: 'Tunnel Profile' })}
                  rules={[
                    { required: true }
                  ]}
                  children={
                    <Select
                      loading={isTunnelLoading}
                      onChange={onTunnelProfileChange}
                      placeholder={$t({ defaultMessage: 'Select...' })}
                      options={tunnelProfileOptions}
                      disabled={editMode}
                    />
                  }
                />
              </Col>
            </Row> : <>
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
                      // eslint-disable-next-line max-len
                      $t({ defaultMessage: '<VenueSingular></VenueSingular> with RUCKUS Edge deployed' })}
                    rules={[{
                      required: true,
                      // eslint-disable-next-line max-len
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
            </>
        }

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