

import { useEffect, useState } from 'react'


import { Checkbox, Col, Form, Row, Select, Space } from 'antd'
import { CheckboxValueType }                       from 'antd/lib/checkbox/Group'
import { useIntl }                                 from 'react-intl'
import { useParams }                               from 'react-router-dom'

import { Button, Loader, StepsForm, useStepFormContext }                                                                             from '@acx-ui/components'
import { TunnelProfileAddModal }                                                                                                     from '@acx-ui/rc/components'
import { useGetNetworkSegmentationViewDataListQuery, useGetTunnelProfileViewDataListQuery, useVenueNetworkActivationsDataListQuery } from '@acx-ui/rc/services'
import { getTunnelProfileOptsWithDefault, isDsaeOnboardingNetwork, TunnelProfileFormType, TunnelTypeEnum }                           from '@acx-ui/rc/utils'

import { NetworkSegmentationGroupFormData } from '..'

import { AddDpskModal } from './AddDpskModal'
import * as UI          from './styledComponents'

const tunnelProfileDefaultPayload = {
  fields: ['name', 'id', 'type'],
  filters: {
    type: [TunnelTypeEnum.VXLAN]
  },
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
  const [dpskModalVisible, setDpskModalVisible] = useState(false)
  const venueId = form.getFieldValue('venueId')
  const venueName = form.getFieldValue('venueName')

  const { tunnelProfileOptions , isTunnelLoading } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelProfileOptions: getTunnelProfileOptsWithDefault(data?.data, TunnelTypeEnum.VXLAN),
        isTunnelLoading: isLoading
      }
    }
  })

  const onTunnelProfileChange = (value: string) => {
    form.setFieldValue('tunnelProfileName',
      tunnelProfileOptions?.find(item => value === item.value)?.label
    )}

  const { networkList } = useVenueNetworkActivationsDataListQuery({
    params: { ...params },
    payload: {
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      venueId: venueId
    }
  }, {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => {
      return {
        networkList: data,
        isLoading
      }
    }
  })
  const networkOptions = networkList?.filter(item =>
    item.type === 'dpsk' && !isDsaeOnboardingNetwork(item))
    .map(item => ({ label: item.name as string, value: item.id as string }))
  const networkIds = networkList?.map(item => (item.id))

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
                onChange={onTunnelProfileChange}
                loading={isTunnelLoading}
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
                          !unusedNetworkOptions?.length &&
                            $t({ defaultMessage: 'No networks activated on Venue ({venueName})' },
                              { venueName: venueName })
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
