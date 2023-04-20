

import { useEffect, useState } from 'react'

import { Checkbox, Col, Form, Row, Select, Space } from 'antd'
import { CheckboxValueType }                       from 'antd/lib/checkbox/Group'
import { useIntl }                                 from 'react-intl'
import { useParams }                               from 'react-router-dom'

import { Loader, StepsForm, useStepFormContext }                          from '@acx-ui/components'
import { useGetTunnelProfileViewDataListQuery, useVenueNetworkListQuery } from '@acx-ui/rc/services'

import { NetworkSegmentationGroupFormData } from '..'
import { useWatch }                         from '../../useWatch'

import * as UI                from './styledComponents'
import { TunnelProfileModal } from './TunnelProfileModal'

const venueNetworkDefaultPayload = {
  fields: ['name', 'id'],
  filters: { nwSubType: ['dpsk'] },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const tunnelProfileDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const WirelessNetworkForm = () => {

  const { $t } = useIntl()
  const params = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const [defaultTunnelValue, setDefaultTunnelValue] = useState('')
  const venueId = useWatch('venueId', form)
  const tunnelProfileId = useWatch('vxlanTunnelProfileId', form)
  const { tunnelOptions = [], isLoading: isTunnelLoading } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelOptions: data?.data.filter(item => item.id !== params.tenantId)
          .map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })
  const { networkOptions, isLoading: isDpskLoading } = useVenueNetworkListQuery({
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
    } else if(tunnelProfileId === params.tenantId) {
      setDefaultTunnelValue(tunnelProfileId)
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
      <StepsForm.Title>{$t({ defaultMessage: 'Wireless Network Settings' })}</StepsForm.Title>
      <Row gutter={20} align='middle'>
        <Col span={8}>
          <Form.Item
            name='vxlanTunnelProfileId'
            label={$t({ defaultMessage: 'Tunnel Profile' })}
            children={
              <Select
                loading={isTunnelLoading}
                options={[
                  { label: $t({ defaultMessage: 'Default' }), value: defaultTunnelValue },
                  ...tunnelOptions
                ]}
              />
            }
          />
        </Col>
        <TunnelProfileModal />
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
            <Loader states={[{ isLoading: isDpskLoading, isFetching: false }]}>
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
                      {
                        networkOptions?.map(item => (
                          <Checkbox value={item.value} children={item.label} key={item.value} />
                        ))
                      }
                    </Space>
                  </Checkbox.Group>
                }
              />
            </Loader>
          </Space>
        </Col>
      </Row>
    </>
  )
}
