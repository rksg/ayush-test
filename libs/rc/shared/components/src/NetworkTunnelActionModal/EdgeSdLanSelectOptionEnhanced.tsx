import { useEffect, useMemo, useState } from 'react'

import { Form, Row, Space, Typography } from 'antd'
import { useIntl }                      from 'react-intl'

import { Button }                                                         from '@acx-ui/components'
import { useGetEdgeFeatureSetsQuery, useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  IncompatibilityFeatures,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getPolicyDetailsLink,
  getServiceDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFwdDestination }  from './EdgeSdLanFwdDestination'
import { EdgeSdLanSelectionDrawer } from './EdgeSdLanSelectionDrawer'

interface EdgeSdLanSelectOptionEnhancedProps {
  venueId: string
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
}

export const EdgeSdLanSelectOptionEnhanced = (props: EdgeSdLanSelectOptionEnhancedProps) => {
  const { $t } = useIntl()
  const { venueId, networkType, hasVlanPool } = props
  const form = Form.useFormInstance()
  const [sdLanTableDrawerVisible, setSdLanTableDrawerVisible] = useState(false)

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

  const originVenueSdLan = useMemo(() => {
    return sdLanOptions?.find(x => x.tunneledWlans?.some(t => t.venueId === venueId))
  }, [sdLanOptions, venueId])

  const handleSdLanSelectSubmit = (sdLanId: string | undefined) => {
    const profileData = sdLanOptions?.find(item => item.id === sdLanId)
    form.setFieldValue(['sdLan', 'newProfileId'], sdLanId)
    form.setFieldValue(['sdLan', 'newProfile'], profileData)

    setSdLanTableDrawerVisible(false)
  }

  const openSdLanTableDrawer = () => {
    setSdLanTableDrawerVisible(true)
  }

  // set initial selected sdLan ID
  useEffect(() => {
    const originProfileId = originVenueSdLan?.id ?? ''
    const profileData = sdLanOptions?.find(item => item.id === originProfileId)

    form.setFieldValue(['sdLan', 'oldProfileId'], originProfileId)
    form.setFieldValue(['sdLan', 'newProfileId'], originProfileId)
    form.setFieldValue(['sdLan', 'newProfile'], profileData)

  }, [originVenueSdLan, sdLanOptions])

  const Content = useMemo(() => (props: { value?: string }) => {
    const selectedSdLan = sdLanOptions?.find(x => x.id === props.value)

    return selectedSdLan
      ? <SdLanAssociated
        selectedSdLan={selectedSdLan}
        openSdLanSelectionDrawer={openSdLanTableDrawer}
        requiredFw={requiredFw}
        isFeatureSetsLoading={isFeatureSetsLoading}
        networkType={networkType}
        hasVlanPool={hasVlanPool}
      />
      : <NoSdLan
        openSdLanSelectionDrawer={openSdLanTableDrawer}
      />
  }, [sdLanOptions, requiredFw, networkType, hasVlanPool])

  return <Row>
    <Form.Item
      label={$t({ defaultMessage: 'Associated SD-LAN service' })}
      name={['sdLan', 'newProfileId']}
    >
      <Content/>
    </Form.Item>
    <EdgeSdLanSelectionDrawer
      sdLanOptions={sdLanOptions}
      visible={sdLanTableDrawerVisible}
      onClose={() => {
        setSdLanTableDrawerVisible(false)
      }}
      onSubmit={handleSdLanSelectSubmit}
    />
  </Row>
}

const NoSdLan = (props: { openSdLanSelectionDrawer: () => void }) => {
  const { $t } = useIntl()
  return <Space >
    <Typography.Text>
      {$t({
        defaultMessage: 'No SD-LAN set for this <venueSingular></venueSingular> yet'
      })}
    </Typography.Text>
    <Button type='link' onClick={props.openSdLanSelectionDrawer}>
      {$t({ defaultMessage: 'Select' })}
    </Button>
  </Space>
}

const SdLanAssociated = (props: {
  selectedSdLan: EdgeMvSdLanViewData
  openSdLanSelectionDrawer: () => void
  requiredFw: string | undefined
  isFeatureSetsLoading: boolean
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
}) => {
  const { $t } = useIntl()
  const { selectedSdLan, openSdLanSelectionDrawer, ...rest } = props

  return <><Form.Item>
    <Space>
      <SdLanProfileName
        id={selectedSdLan?.id}
        name={selectedSdLan?.name}
      />
      <Button type='link' onClick={openSdLanSelectionDrawer}>
        {$t({ defaultMessage: 'Change' })}
      </Button>
    </Space>
  </Form.Item>
  <Row>
    <Form.Item label={$t({ defaultMessage: 'Tunnel Profile' })} >
      <TunnelProfileName
        id={selectedSdLan?.tunnelProfileId}
        name={selectedSdLan?.tunnelProfileName}
      />
    </Form.Item>
  </Row>
  <Row>
    <EdgeSdLanFwdDestination
      venueSdLan={selectedSdLan}
      {...rest}
    />
  </Row>
  </>
}

const SdLanProfileName = (props: {
  id: string | undefined
  name: string | undefined
}) => {
  const { id, name } = props
  const linkToSdLanDetail = id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: id
  }) : undefined

  return name && linkToSdLanDetail
    ? <TenantLink to={linkToSdLanDetail}>{name}</TenantLink>
    : null
}

const TunnelProfileName = (props: {
  id: string | undefined,
  name: string | undefined
}) => {
  const { id, name } = props
  const linkToTunnelProfileDetail = id ? getPolicyDetailsLink({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.DETAIL,
    policyId: id
  }) : undefined

  return (name && linkToTunnelProfileDetail)
    ? <TenantLink to={linkToTunnelProfileDetail}>{name}</TenantLink>
    : null
}