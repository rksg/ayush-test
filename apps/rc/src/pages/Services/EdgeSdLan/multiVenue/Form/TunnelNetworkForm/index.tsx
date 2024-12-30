import { useEffect } from 'react'

import { Col, Form, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { StepsForm, useStepFormContext }        from '@acx-ui/components'
import { Features }                             from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                from '@acx-ui/rc/components'
import { useGetTunnelProfileViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanFormModel,
  EdgeMvSdLanFormNetwork,
  getTunnelProfileOptsWithDefault,
  getVlanVxlanDefaultTunnelProfileOpt,
  isVlanVxlanDefaultTunnelProfile,
  MtuTypeEnum,
  TunnelTypeEnum
} from '@acx-ui/rc/utils'

import { messageMappings } from '../messageMappings'

import { DmzTunnelProfileFormItem }    from './DmzTunnelProfileFormItem'
import { TunnelProfileFormItem }       from './TunnelProfileFormItem'
import { EdgeSdLanVenueNetworksTable } from './VenueNetworkTable'

const tunnelProfileDefaultPayload = {
  fields: ['name', 'id', 'type', 'mtuType'],
  filters: { type: [TunnelTypeEnum.VLAN_VXLAN] },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const TunnelNetworkForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext<EdgeMvSdLanFormModel>()
  const isGuestTunnelEnabled = form.getFieldValue('isGuestTunnelEnabled')
  const isEdgeNatTraversalP1Ready = useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)

  const {
    tunnelProfileData,
    isTunnelOptionsLoading
  } = useGetTunnelProfileViewDataListQuery({
    payload: isEdgeNatTraversalP1Ready
      ? { ...tunnelProfileDefaultPayload,
        fields: ['name', 'id', 'type', 'mtuType', 'natTraversalEnabled'] }
      : tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelProfileData: data?.data.filter(tt => !isVlanVxlanDefaultTunnelProfile(tt.id)),
        isTunnelOptionsLoading: isLoading
      }
    }
  })

  // eslint-disable-next-line max-len
  const tunnelProfileOptions = getTunnelProfileOptsWithDefault(tunnelProfileData, TunnelTypeEnum.VLAN_VXLAN)
  const dcTunnelProfileOptions = (tunnelProfileData
    ?.map(item => ({ label: item.name!, value: item.id! }))) ?? []
  const isSdLanDefaultExist = dcTunnelProfileOptions
    .filter(item => isVlanVxlanDefaultTunnelProfile(item.value)).length > 0
  if (!isSdLanDefaultExist) {
    const vlanVxLanDefault = getVlanVxlanDefaultTunnelProfileOpt()
    dcTunnelProfileOptions.push(vlanVxLanDefault)
  }

  const dmzTunnelProfileOptions = (tunnelProfileData
    ?.filter(item => item.mtuType === MtuTypeEnum.MANUAL)
    ?.filter(item => isEdgeNatTraversalP1Ready ? item.natTraversalEnabled === false : item)
    ?.map(item => ({ label: item.name!, value: item.id! }))) ?? []

  const onTunnelChange = (val: string) => {
    form.setFieldValue('tunnelProfileName',
      tunnelProfileOptions?.filter(i => i.value === val)[0]?.label)
  }

  const onDmzTunnelChange = (val: string) => {
    form.setFieldValue('guestTunnelProfileName',
      tunnelProfileOptions?.filter(i => i.value === val)[0]?.label)
  }

  useEffect(() => {
    if (editMode) {
      form.validateFields()
    }
  }, [])

  return (
    <>
      <Row>
        <Col span={24}>
          <StepsForm.Title>{$t({ defaultMessage: 'Tunnel & Network Settings' })}</StepsForm.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <TunnelProfileFormItem
            options={dcTunnelProfileOptions}
            isLoading={isTunnelOptionsLoading}
            onChange={onTunnelChange}
          />
        </Col>
      </Row>
      {isGuestTunnelEnabled &&
        <Row>
          <Col span={24}>
            <DmzTunnelProfileFormItem
              options={dmzTunnelProfileOptions}
              isLoading={isTunnelOptionsLoading}
              onChange={onDmzTunnelChange}
            />
          </Col>
        </Row>
      }
      <Row >
        <Col span={24}>
          <Typography.Text>
            {$t(messageMappings.scope_network_table_description)}
          </Typography.Text>
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <Form.Item
            name='activatedNetworks'
            dependencies={['isGuestTunnelEnabled', 'activatedGuestNetworks']}
            rules={[
              { required: true },
              {
                validator: (_, value) => {
                  return value && Object.keys((value as EdgeMvSdLanFormNetwork)).length > 0
                    ? Promise.resolve()
                  // eslint-disable-next-line max-len
                    : Promise.reject($t({ defaultMessage: 'Please select at least 1 <venueSingular></venueSingular> network' }))
                }
              }
            ]}
          >
            <EdgeSdLanVenueNetworksTable />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}