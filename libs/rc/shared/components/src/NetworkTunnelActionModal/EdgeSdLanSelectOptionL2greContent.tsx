import { useEffect, useMemo } from 'react'

import { Form, Row, Typography } from 'antd'
import { useIntl }               from 'react-intl'

import { Select }                                                         from '@acx-ui/components'
import { useGetEdgeFeatureSetsQuery, useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import {
  IncompatibilityFeatures,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFwdDestination } from './EdgeSdLanFwdDestination'

interface EdgeSdLanContentProps {
  venueId: string
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
}

export const EdgeSdLanSelectOptionL2greContent = (props: EdgeSdLanContentProps) => {
  const { $t } = useIntl()
  const { venueId, networkType, hasVlanPool } = props
  const form = Form.useFormInstance()
  const selectedSdLanId = Form.useWatch(['sdLan', 'newProfileId'], form)

  const { sdLanOptions } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: [
        'id',
        'name',
        'venueId',
        'isGuestTunnelEnabled',
        'edgeClusterId', 'edgeClusterName', 'guestEdgeClusterId', 'guestEdgeClusterName',
        'tunnelProfileId', 'tunnelProfileName',
        'tunneledWlans', 'tunneledGuestWlans'
      ],
      pageSize: 10000
    }
  }, { selectFromResult: ({ data }) => ({ sdLanOptions: data?.data }) })

  const originVenueSdLan = useMemo(() => {
    return sdLanOptions?.find(x => x.tunneledWlans?.some(t => t.venueId === venueId))
  }, [sdLanOptions, venueId])

  // set initial selected sdLan ID
  useEffect(() => {
    const originProfileId = originVenueSdLan?.id ?? ''
    form.setFieldValue(['sdLan', 'oldProfileId'], originProfileId)
    form.setFieldValue(['sdLan', 'newProfileId'], originProfileId)
  }, [originVenueSdLan])

  const selectedSdLan = useMemo(() =>
    sdLanOptions?.find(x => x.id === selectedSdLanId)
  , [selectedSdLanId])

  const tunnelProfileName = useMemo(() => {
    const target = selectedSdLan
    const linkToTunnelProfileDetail = target?.tunnelProfileId ? getPolicyDetailsLink({
      type: PolicyType.TUNNEL_PROFILE,
      oper: PolicyOperation.DETAIL,
      policyId: target?.tunnelProfileId!
    }) : undefined

    return (target && linkToTunnelProfileDetail)
      ? <TenantLink to={linkToTunnelProfileDetail}>{target?.tunnelProfileName}</TenantLink>
      : ''
  }, [selectedSdLan])

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

  const onChange = (value:string) => {
    form.setFieldValue(['sdLan', 'newProfileName'],
      sdLanOptions?.find(item => item.id === value)?.name ?? '')
  }

  return <Row>
    <Typography.Text style={{ color: 'inherit' }}>
      {
        <div className={'ant-form-item-label'}>
          <label>{$t({ defaultMessage: 'Tunnel the traffic to a central location' })}</label>
          <br /><br />
          <Row>
            <Form.Item
              label={$t({ defaultMessage: 'SD-LAN Profile' })}
              name={['sdLan', 'newProfileId']}
            >
              <Select
                style={{ width: '220px' }}
                onChange={onChange}
                options={[
                  {
                    label: $t({ defaultMessage: 'Select...' }), value: ''
                  },
                  ...((sdLanOptions ?? []).map(item => ({
                    label: item.name,
                    value: item.id
                  })))
                ]}
              />
            </Form.Item>
          </Row>

          <Row>
            <Form.Item label={$t({ defaultMessage: 'Tunnel Profile' })} >
              <div>
                {tunnelProfileName}
              </div>
            </Form.Item>
          </Row>
          <Row>
            <EdgeSdLanFwdDestination
              venueSdLan={selectedSdLan}
              requiredFw={requiredFw}
              disabled={isFeatureSetsLoading}
              networkType={networkType}
              hasVlanPool={hasVlanPool}
            />
          </Row>
        </div>
      }
    </Typography.Text>
  </Row>
}