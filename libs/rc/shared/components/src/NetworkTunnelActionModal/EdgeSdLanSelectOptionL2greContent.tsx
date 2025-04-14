import { useMemo } from 'react'

import { Form, Row, Select, Typography } from 'antd'
import { DefaultOptionType }             from 'antd/es/cascader'
import { useIntl }                       from 'react-intl'

import { transToOptions, useGetAvailableTunnelProfile } from '@acx-ui/edge/components'
import {
  EdgeMvSdLanViewData,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  TunnelProfileViewData,
  TunnelTypeEnum,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  getServiceRoutePath,
  useHelpPageLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'



interface EdgeSdLanContentProps {
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
}

export const EdgeSdLanSelectOptionL2greContent = (props: EdgeSdLanContentProps) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const {
    venueSdLan,
    networkType,
    hasVlanPool
  } = props

  const addSdLanPageLink = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.CREATE
  })
  const helpUrl = useHelpPageLink(addSdLanPageLink)

  const isVenueSdLanExist = !!venueSdLan

  const linkToSdLanDetail = venueSdLan?.id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: venueSdLan?.id
  }) : undefined

  const linkToTunnelProfileDetail = venueSdLan?.tunnelProfileId ? getPolicyDetailsLink({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.DETAIL,
    policyId: venueSdLan?.tunnelProfileId!
  }) : undefined

  const sdlanName = (isVenueSdLanExist && linkToSdLanDetail)
    ? <TenantLink to={linkToSdLanDetail}>{venueSdLan?.name}</TenantLink>
    : ''

  const tunnelProfileName = (isVenueSdLanExist && linkToTunnelProfileDetail)
    ? <TenantLink to={linkToTunnelProfileDetail}>{venueSdLan?.tunnelProfileName}</TenantLink>
    : ''


  // eslint-disable-next-line max-len
  const activatedForwardingTunnelProfileIds = venueSdLan?.tunneledWlans
    ?.map(item => item.forwardingTunnelProfileId)
    ?.filter((id): id is string => typeof id === 'string') || []

  const { isDataLoading,
    // eslint-disable-next-line max-len
    availableTunnelProfiles } = useGetAvailableTunnelProfile({ serviceIds: venueSdLan?.id ? [venueSdLan.id] : [undefined] })

  const tunnelProfileOptions = useMemo(() => [
    {
      label: $t({ defaultMessage: 'Core Port' }),
      value: ''
    },
    ...transToOptions(
      (availableTunnelProfiles || []).filter(item => item.id !== venueSdLan?.tunnelProfileId),
      activatedForwardingTunnelProfileIds
    )
  ], [availableTunnelProfiles, isDataLoading])

  const getFilteredTunnelProfileOptions = (
    tunnelProfileOptions: DefaultOptionType[],
    availableTunnelProfiles: TunnelProfileViewData[]
  ) => {
    const isCaptivePortal = networkType === NetworkTypeEnum.CAPTIVEPORTAL
    return tunnelProfileOptions
      .map(item => {
        const profile = availableTunnelProfiles.find(profile => profile.id === item.value)

        // Skip VXLAN-GPE options for non-CAPTIVEPORTAL networks
        if (!isCaptivePortal && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
          return null
        }

        // Disable VXLAN-GPE options for vlan pooling networks
        if (hasVlanPool && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
          return {
            ...item,
            disabled: true,
            title: $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
          }
        }

        return item
      })
      .filter((item): item is DefaultOptionType => item !== null)
  }

  const onChangeTunnel = (value:string) => {
    form.setFieldValue(['sdLan', 'forwardingTunnelProfileType'],
      availableTunnelProfiles?.find(item => item.id === value)?.tunnelType ?? '')
  }

  return <Row><Form.Item noStyle >
    <Typography.Text style={{ color: 'inherit' }}>
      {
        isVenueSdLanExist
        // eslint-disable-next-line max-len
          ? (<div className={'ant-form-item-label'}><label>{$t({ defaultMessage: 'Tunnel the traffic to a central location' })}</label><br /><br />
            <Row>
              <Form.Item
                label={$t({ defaultMessage: 'Service Name' })}>
                <div>
                  {sdlanName}
                </div>
              </Form.Item></Row>
            <Row>
              <Form.Item
                label={$t({ defaultMessage: 'Tunnel Profile' })}>
                <div >
                  {tunnelProfileName}
                </div>
              </Form.Item></Row>
            <Row>
              <Form.Item
                name={['sdLan', 'forwardingTunnelProfileId']}
                label={$t({ defaultMessage: 'Forwarding Destination' })}
                initialValue={''}
                children={<Select
                  style={{ width: '220px' }}
                  // eslint-disable-next-line max-len
                  options={getFilteredTunnelProfileOptions(tunnelProfileOptions, availableTunnelProfiles)}
                  onChange={onChangeTunnel}
                />}
              />
            </Row>
          </div>)
        // eslint-disable-next-line max-len
          : (<div className={'ant-form-item-label'}><label>{$t({ defaultMessage: 'Tunnel the traffic to a central location. {infoLink}' }, {
            infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
              {$t({ defaultMessage: 'See more information' })}
            </a>
          })}</label></div>)
      }
    </Typography.Text>
  </Form.Item></Row>
}