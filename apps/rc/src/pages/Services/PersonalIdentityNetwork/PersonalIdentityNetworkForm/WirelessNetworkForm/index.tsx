

import { useContext, useState } from 'react'


import { Checkbox, Col, Form, Row, Select, Space } from 'antd'
import { CheckboxValueType }                       from 'antd/lib/checkbox/Group'
import { useIntl }                                 from 'react-intl'

import { Button, Loader, StepsForm, useStepFormContext } from '@acx-ui/components'
import { TunnelProfileAddModal }                         from '@acx-ui/rc/components'
import { TunnelProfileFormType, TunnelTypeEnum }         from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkFormData }    from '..'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { AddDpskModal } from './AddDpskModal'
import * as UI          from './styledComponents'

export const WirelessNetworkForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    tunnelProfileOptions,
    isTunnelLoading,
    networkOptions,
    isNetworkOptionsLoading,
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

  const formInitValues ={
    type: TunnelTypeEnum.VXLAN,
    disabledFields: ['type']
  }

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
              />
            }
          />
        </Col>
        <TunnelProfileAddModal initialValues={formInitValues as TunnelProfileFormType} />
      </Row>
      <Row gutter={20}>
        <Col>
          <Space direction='vertical'>
            {
              $t({
                defaultMessage: `Apply the tunnel profile to the following
                networks that you want to enable personal identity network:`
              })
            }
            <Space size={1}>
              <UI.InfoIcon />
              <UI.Description>
                {
                  $t({
                    defaultMessage: `The client isolation service will be disabled
                      and VLAN ID will be set to 1 for the checked networks.`
                  })
                }
              </UI.Description>
            </Space>
            <Loader states={[{ isLoading: isNetworkOptionsLoading, isFetching: false }]}>
              <Form.Item
                name='networkIds'
                children={
                  <Checkbox.Group onChange={onNetworkChange}>
                    <Space direction='vertical'>
                      {
                        networkOptions?.map(item => (
                          <Checkbox value={item.value} children={item.label} key={item.value} />
                        ))
                      }
                      <UI.Description>
                        {
                          !networkOptions?.length &&
                            $t({ defaultMessage: 'No networks activated on Venue ({venueName})' },
                              { venueName: getVenueName(venueId) })
                        }
                      </UI.Description>
                    </Space>
                  </Checkbox.Group>
                }
              />
            </Loader>
            <Button
              type='link'
              onClick={openDpskModal}
              children={$t({ defaultMessage: 'Add DPSK Network' })}
            />
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
