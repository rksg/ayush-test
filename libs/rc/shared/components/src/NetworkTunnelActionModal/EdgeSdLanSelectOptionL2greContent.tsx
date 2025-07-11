
import { Form, Row, Typography } from 'antd'
import { useIntl }               from 'react-intl'

import { useGetEdgeFeatureSetsQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  IncompatibilityFeatures,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  getServiceRoutePath,
  useHelpPageLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFwdDestination } from './EdgeSdLanFwdDestination'

interface EdgeSdLanContentProps {
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
}

export const EdgeSdLanSelectOptionL2greContent = (props: EdgeSdLanContentProps) => {
  const { $t } = useIntl()
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

  const { requiredFw, isFeatureSetsLoading } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.L2OGRE]
      }
    } }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.L2OGRE)?.requiredFw,
        isFeatureSetsLoading: isLoading
      }
    }
  })

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
              <EdgeSdLanFwdDestination
                sdLanData={venueSdLan}
                networkType={networkType}
                hasVlanPool={hasVlanPool}
                requiredFw={requiredFw}
                disabled={isFeatureSetsLoading}
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