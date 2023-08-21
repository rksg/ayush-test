

import { useEffect, useState } from 'react'


import { Checkbox, Col, Form, Row, Select, Space } from 'antd'
import { CheckboxValueType }                       from 'antd/lib/checkbox/Group'
import { useIntl }                                 from 'react-intl'
import { useParams }                               from 'react-router-dom'

import { Loader, StepsForm, useStepFormContext }                                                                      from '@acx-ui/components'
import { useGetTunnelProfileViewDataListQuery, useVenueNetworkListQuery, useGetNetworkSegmentationViewDataListQuery } from '@acx-ui/rc/services'

import { NetworkSegmentationGroupFormData } from '..'
import { useWatch }                         from '../../useWatch'

import * as UI                from './styledComponents'
import { TunnelProfileModal } from './TunnelProfileModal'

const venueNetworkDefaultPayload = {
  fields: ['name', 'id', 'venues'],
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
  const [unusedNetworkOptions, setUnusedNetworkOptions] =
  useState<{ label: string; value: string; }[]|undefined>(undefined)
  const [isFilterNetworksLoading, setIsFilterNetworksLoading] = useState(true)
  const venueId = useWatch('venueId', form)
  const venueName = useWatch('venueName', form)

  const { tunnelProfileList , isTunnelLoading } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelProfileList: data,
        isTunnelLoading: isLoading
      }
    }
  })

  const hasDefaultProfile = tunnelProfileList?.data.some(item => item.id === params.tenantId )
  const tunnelProfileOptions = tunnelProfileList?.data
    .map(item => ({ label: item.name, value: item.id }))
  if (!hasDefaultProfile) {
    tunnelProfileOptions?.unshift({ label: 'Default', value: params.tenantId as string })
  }

  const onTunnelProfileChange = (value: string) => {
    form.setFieldValue('tunnelProfileName',
      tunnelProfileOptions?.find(item => value === item.value)?.label
    )}

  const { networkList } = useVenueNetworkListQuery({
    params: { ...params, venueId: venueId },
    payload: venueNetworkDefaultPayload
  }, {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => {
      return {
        networkList: data,
        isLoading
      }
    }
  })
  const networkOptions = networkList?.data
    .filter(item => item.venues?.ids.includes(venueId))
    .map(item => ({ label: item.name, value: item.id }))
  const networkIds = networkList?.data.map(item => (item.id))

  const { nsgViewData } =
  useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { networkIds: networkIds }
    }
  }, {
    skip: !!!networkIds,
    selectFromResult: ({ data, isLoading }) => {
      return {
        nsgViewData: data,
        isLoading
      }
    }
  })

  useEffect(()=>{
    if (nsgViewData) {
      const usedNetworkIds = nsgViewData?.data
        .filter(item => item.id !== params.serviceId)
        .flatMap(item => item.networkIds)

      setUnusedNetworkOptions(
        networkOptions?.filter(item => !usedNetworkIds.includes(item.value))
      )
      setIsFilterNetworksLoading(false)
    }
  }, [nsgViewData])

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
            rules={[{ required: true }]}
            children={
              <Select
                onChange={onTunnelProfileChange}
                loading={isTunnelLoading}
                options={tunnelProfileOptions}
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
            <Loader states={[{ isLoading: isFilterNetworksLoading, isFetching: false }]}>
              <Form.Item
                name='networkIds'
                children={
                  <Checkbox.Group onChange={onNetworkChange}>
                    <Space direction='vertical'>
                      {
                        unusedNetworkOptions?.map(item => (
                          <Checkbox value={item.value} children={item.label} key={item.value} />
                        ))
                      }
                      <UI.Description>
                        {
                          unusedNetworkOptions?.length == 0 &&
                            $t({ defaultMessage: 'No networks activated on {venueName}' },
                              { venueName: venueName })
                        }
                      </UI.Description>
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
