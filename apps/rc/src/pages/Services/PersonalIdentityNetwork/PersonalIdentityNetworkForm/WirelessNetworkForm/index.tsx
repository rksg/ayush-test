/* eslint-disable max-len */
import { useContext, useState } from 'react'

import { Checkbox, Col, Form, Row, Select, Space, Typography } from 'antd'
import { CheckboxValueType }                                   from 'antd/lib/checkbox/Group'
import { useIntl }                                             from 'react-intl'

import { Button, Loader, StepsForm, useStepFormContext, defaultRichTextFormatValues }                                                from '@acx-ui/components'
import { Features }                                                                                                                  from '@acx-ui/feature-toggle'
import { TunnelProfileAddModal, useIsEdgeFeatureReady }                                                                              from '@acx-ui/rc/components'
import { TunnelProfileFormType, TunnelTypeEnum, PersonalIdentityNetworkFormData, TunnelProfileUrls, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { hasPermission }                                                                                                             from '@acx-ui/user'
import { getOpsApi }                                                                                                                 from '@acx-ui/utils'

import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { AddDpskModal } from './AddDpskModal'
import * as UI          from './styledComponents'

const tunnelProfileFormInitValues ={
  type: TunnelTypeEnum.VXLAN,
  disabledFields: ['type', 'natTraversalEnabled']
}

export const WirelessNetworkForm = () => {

  const { $t } = useIntl()
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)

  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    tunnelProfileOptions,
    isTunnelLoading,
    networkOptions,
    isNetworkOptionsLoading,
    dpskData,
    getVenueName
  } = useContext(PersonalIdentityNetworkFormContext)
  const [dpskModalVisible, setDpskModalVisible] = useState(false)
  const venueId = form.getFieldValue('venueId')

  const onNetworkChange = (values: CheckboxValueType[]) => {
    form.setFieldValue('networkNames', values.map(item =>
      (networkOptions?.find(network =>
        network.value === item)?.label))
      .filter(item => !!item))
  }

  const openDpskModal = () => {
    setDpskModalVisible(true)
  }

  const hasCreateTunnelPermission = hasPermission({
    rbacOpsIds: [
      getOpsApi(TunnelProfileUrls.createTunnelProfile)
    ]
  })

  const hasCreateDpskPermission = hasPermission({
    rbacOpsIds: [
      [
        getOpsApi(WifiRbacUrlsInfo.addNetworkDeep),
        getOpsApi(WifiUrlsInfo.activateDpskService)
      ]
    ]
  })

  return(
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Wireless Network Settings' })}</StepsForm.Title>
      <Row gutter={20} align='middle'>
        <Col span={8}>
          <Form.Item
            name='vxlanTunnelProfileId'
            label={$t({ defaultMessage: 'Tunnel Profile' })}
            rules={[{ required: true }]}
            children={
              <Select
                loading={isTunnelLoading}
                placeholder={$t({ defaultMessage: 'Select...' })}
                options={tunnelProfileOptions}
              />}
          />
        </Col>
        {
          hasCreateTunnelPermission &&
          <TunnelProfileAddModal
            initialValues={tunnelProfileFormInitValues as TunnelProfileFormType}
          />
        }
      </Row>
      <Row gutter={20}>
        <Col>
          <Space direction='vertical'>
            {isEdgePinEnhanceReady
              ? $t({ defaultMessage: 'Select DPSK networks that you want to enable PIN service:*' })
              : $t({ defaultMessage: 'Apply the tunnel profile to the following networks that you want to enable personal identity network:' })
            }
            {!isEdgePinEnhanceReady && <Space size={1}>
              <UI.InfoIcon />
              <UI.Description>
                {$t({ defaultMessage: 'The client isolation service will be disabled and VLAN ID will be set to 1 for the checked networks.' })}
              </UI.Description>
            </Space>}
            <Loader states={[{ isLoading: isNetworkOptionsLoading, isFetching: false }]}>
              <Form.Item
                name='networkIds'
                rules={isEdgePinEnhanceReady ? [{
                  required: true, message: $t({ defaultMessage: 'Please select network' })
                }] : undefined}
              >
                <Checkbox.Group onChange={onNetworkChange}>
                  <Space direction='vertical'>
                    {networkOptions?.map(item => (
                      <Checkbox value={item.value} children={item.label} key={item.value} />
                    ))}
                    <UI.Description>
                      {!networkOptions?.length && $t({ defaultMessage: 'No networks activated on <VenueSingular></VenueSingular> ({venueName})' }, { venueName: getVenueName(venueId) })}
                    </UI.Description>
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Loader>
            {
              hasCreateDpskPermission &&
              <Button
                type='link'
                onClick={openDpskModal}
                children={$t({ defaultMessage: 'Add DPSK Network' })}
              />
            }

            {isEdgePinEnhanceReady && <Row style={{ marginTop: '20px' }}>
              <Col span={24}>
                <Typography.Text children={$t({ defaultMessage: 'Notes:' })} />
              </Col>
              <Col span={24}>
                <Space size={1}>
                  <UI.InfoIcon />
                  <UI.Description>
                    {$t({ defaultMessage: 'The client isolation service will be disabled and VLAN ID will be set to 1 for the selected networks.' })}
                  </UI.Description>
                </Space>
              </Col>
              <Col span={24}>
                <Space size={1}>
                  <UI.InfoIcon />
                  <UI.Description>
                    {$t({ defaultMessage: 'Only DPSK networks linked to the DPSK service (<b>{dpskServiceName}</b>) can operate in this PIN service.' },
                      { ...defaultRichTextFormatValues, dpskServiceName: dpskData?.name })}
                  </UI.Description>
                </Space>
              </Col>
            </Row>}
            <AddDpskModal
              visible={dpskModalVisible}
              setVisible={setDpskModalVisible}
            />
          </Space>
        </Col>
      </Row>
    </>
  )
}