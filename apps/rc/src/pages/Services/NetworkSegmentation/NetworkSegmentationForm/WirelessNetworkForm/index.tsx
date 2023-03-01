

import { useEffect } from 'react'

import { Checkbox, Col, Form, Row, Select, Space } from 'antd'
import { CheckboxValueType }                       from 'antd/lib/checkbox/Group'
import { useIntl }                                 from 'react-intl'
import { useParams }                               from 'react-router-dom'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import { useVenueNetworkListQuery }      from '@acx-ui/rc/services'

import { NetworkSegmentationGroupForm } from '..'
import { useWatch }                     from '../../useWatch'

import * as UI from './styledComponents'

const venueNetworkDefaultPayload = {
  fields: ['name', 'id'],
  filters: { nwSubType: ['dpsk'] },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const WirelessNetworkForm = () => {

  const { $t } = useIntl()
  const params = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()
  const venueId = useWatch('venueId', form)
  const tunnelProfileId = useWatch('vxlanTunnelProfileId', form)
  const { networkOptions } = useVenueNetworkListQuery({
    params: { ...params, venueId: venueId },
    payload: venueNetworkDefaultPayload
  }, {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => {
      return {
        networkOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })

  useEffect(() => {
    if(!!!tunnelProfileId) {
      form.setFieldValue('tunnelProfileName', 'Default')
    }
  }, [])

  const onNetworkChange = (values: CheckboxValueType[]) => {
    form.setFieldValue('networkNames', values.map(item =>
      (networkOptions?.find(network =>
        network.value === item)?.label))
      .filter(item => !!item))
  }

  return(
    <>
      <Form.Item name='venueId' hidden />{/* Added so useWatch could work */}

      <Row gutter={20}>
        <Col span={8}>
          <StepsForm.Title>{$t({ defaultMessage: 'Wireless Network Settings' })}</StepsForm.Title>
          <Form.Item
            name='vxlanTunnelProfileId'
            label={$t({ defaultMessage: 'Tunnel Profile' })}
            children={
              <Select
                options={[
                  { label: $t({ defaultMessage: 'Default' }), value: null }
                ]}
              />
            }
          />

        </Col>
      </Row>
      <Row gutter={20}>
        <Col>
          <Space direction='vertical'>
            {
              $t({
                defaultMessage: `Apply the tunnel profile to the following
                networks that you want to enable network segmentation:`
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
            <Form.Item
              name='networkIds'
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select at least 1 network' })
                }
              ]}
              children={
                <Checkbox.Group onChange={onNetworkChange}>
                  <Space direction='vertical'>
                    {networkOptions?.map(item => (
                      <Checkbox value={item.value} children={item.label} />
                    ))}
                  </Space>
                </Checkbox.Group>
              }
            />
          </Space>
        </Col>
      </Row>
    </>
  )
}
