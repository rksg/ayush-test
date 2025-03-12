import { useEffect } from 'react'

import { Select,Col, Form, Input, Row, Switch, Space, Typography } from 'antd'
import { findIndex, find }                                         from 'lodash'
import { useIntl }                                                 from 'react-intl'
import { useParams }                                               from 'react-router-dom'

import {  StepsForm, Tooltip, useStepFormContext, Loader }                       from '@acx-ui/components'
import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { InformationSolid }                                                      from '@acx-ui/icons'
import { SpaceWrapper, CompatibilityWarningTriangleIcon, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  useGetEdgeClusterListQuery,
  useGetEdgeFeatureSetsQuery,
  useGetEdgeListQuery
} from '@acx-ui/rc/services'
import {
  servicePolicyNameRegExp,
  useHelpPageLink,
  EdgeMvSdLanFormModel,
  ClusterHighAvailabilityModeEnum,
  IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { TenantLink }      from '@acx-ui/react-router-dom'
import { compareVersions } from '@acx-ui/utils'

import { useEdgeSdLanContext } from '../EdgeSdLanContextProvider'
import { messageMappings }     from '../messageMappings'

import * as UI from './styledComponents'

export const SettingsForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isHaAaDmzEnabled = useIsEdgeFeatureReady(Features.EDGE_HA_AA_DMZ_TOGGLE)

  const { form, editMode, initialValues } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { allSdLans, allPins } = useEdgeSdLanContext()

  const edgeClusterId = Form.useWatch('edgeClusterId', form)
  const guestEdgeClusterId = Form.useWatch('guestEdgeClusterId', form)
  const isGuestTunnelEnabled = Form.useWatch('isGuestTunnelEnabled', form)

  const helpUrl = useHelpPageLink()

  const sdLanBoundEdges = allSdLans.filter(item => item.id !== params.serviceId)
    .flatMap(item => [item.edgeClusterId, item.guestEdgeClusterId])
    .filter(val => !!val)

  const pinBoundEdges = allPins.flatMap(item => [item.edgeClusterInfo?.edgeClusterId])
    .filter(val => !!val)

  const { clusterData, isLoading: isClusterOptsLoading } = useGetEdgeClusterListQuery(
    { payload: {
      fields: [
        'name',
        'venueId',
        'clusterId',
        'clusterStatus',
        'hasCorePort',
        'highAvailabilityMode',
        'firmwareVersion'
      ],
      pageSize: 10000
    } },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterData: data?.data
          // eslint-disable-next-line max-len
            .filter(item => !sdLanBoundEdges.includes(item.clusterId!) && !pinBoundEdges.includes(item.clusterId!)),
          isLoading
        }
      }
    })

  const clusterOptions = clusterData?.map(item => ({
    label: item.name,
    value: item.clusterId
  }))

  // prepare venue id
  useEffect(() => {
    if (editMode && initialValues && clusterData) {
      const { edgeClusterId, guestEdgeClusterId } = initialValues

      // eslint-disable-next-line max-len
      const edgeClusterVenueId = clusterData.filter(i => i.clusterId === edgeClusterId)[0].venueId

      const updateData: Record<string, string|undefined> = { venueId: edgeClusterVenueId }

      if (guestEdgeClusterId) {
      // eslint-disable-next-line max-len
        const guestEdgeClusterVenueId = clusterData.filter(i => i.clusterId === guestEdgeClusterId)[0].venueId
        updateData.guestEdgeClusterVenueId = guestEdgeClusterVenueId
      }

      form.setFieldsValue(updateData)
    }
  }, [clusterData, editMode, initialValues])

  const onEdgeClusterChange = (val: string) => {
    const edgeData = clusterData?.filter(i => i.clusterId === val)[0]
    form.setFieldsValue({
      edgeClusterName: edgeData?.name,
      venueId: edgeData?.venueId
    })
  }

  const onDmzClusterChange = (val: string) => {
    const edgeData = clusterData?.filter(i => i.clusterId === val)[0]
    form.setFieldsValue({
      guestEdgeClusterName: edgeData?.name,
      guestEdgeClusterVenueId: edgeData?.venueId
    })
  }

  const checkCorePortConfigured = (clusterId: string) => {
    if (!clusterData || findIndex(clusterData, { clusterId, hasCorePort: true }) !== -1) {
      return Promise.resolve()
    } else
      return Promise.reject(<UI.ClusterSelectorHelper>
        <InformationSolid />
        {$t(messageMappings.setting_cluster_helper, {
          infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
            {$t({ defaultMessage: 'See more information' })}
          </a>
        })}
      </UI.ClusterSelectorHelper>)
  }

  const dmzHaModeCheck = (dmzClusterId: string | undefined, isGuestTunnelOn: boolean) => {
    const isDmzClusteAAMode = find(clusterData, { clusterId: dmzClusterId })
      ?.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE

    if (clusterData && isGuestTunnelOn && dmzClusterId && isDmzClusteAAMode) {
      return Promise.reject($t({ defaultMessage: 'DMZ cluster cannot be active-active mode.' }))
    } else {
      return Promise.resolve()
    }
  }

  const getDmzClusterOpts = () => clusterOptions?.filter(item => {
    // eslint-disable-next-line max-len
    const isNonAAMode = find(clusterData, { clusterId: item.value })?.highAvailabilityMode !== ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE

    return item.value !== edgeClusterId &&
          // eslint-disable-next-line max-len
          (isHaAaDmzEnabled || (!isHaAaDmzEnabled && (isNonAAMode || (editMode && item.value === guestEdgeClusterId))))
  })

  return (
    <UI.Wrapper>
      <Col span={12}>
        <SpaceWrapper full direction='vertical' size={30} justifycontent='flex-start'>
          <Row>
            <Col span={18}>
              <StepsForm.Title>
                {$t({ defaultMessage: 'Settings' })}
              </StepsForm.Title>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Service Name' })}
                rules={[
                  { required: true },
                  { min: 2, max: 32 },
                  { validator: (_, value) => servicePolicyNameRegExp(value) }
                ]}
                validateFirst
                children={<Input />}
              />
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Row>
                <Col span={18}>
                  <Form.Item
                    name='edgeClusterId'
                    label={<>
                      { $t({ defaultMessage: 'Cluster' }) }
                      <Tooltip.Question
                        title={$t(messageMappings.setting_cluster_tooltip)}
                        placement='bottom'
                      />
                    </>}
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please select a Cluster' })
                    },
                    { validator: (_, value) => checkCorePortConfigured(value) }
                    ]}
                  >
                    <Select
                      loading={isClusterOptsLoading}
                      options={clusterOptions?.filter(item => item.value !== guestEdgeClusterId)}
                      placeholder={$t({ defaultMessage: 'Select ...' })}
                      disabled={editMode}
                      onChange={onEdgeClusterChange}
                    />
                  </Form.Item>
                </Col>
                {edgeClusterId &&
                <Col span={24}>
                  <ClusterFirmwareInfo
                    clusterId={edgeClusterId}
                  />
                </Col>
                }
              </Row>
            </Col>
          </Row>

          <Row>
            <Col span={15}>
              <UI.FieldText>
                {$t({ defaultMessage: 'Tunnel guest traffic to another cluster (DMZ)' })}
              </UI.FieldText>
            </Col>
            <UI.FlexEndCol span={3}>
              <Form.Item
                name='isGuestTunnelEnabled'
                valuePropName='checked'
                noStyle
              >
                <Switch aria-label='dmzEnabled' />
              </Form.Item>
            </UI.FlexEndCol>
          </Row>
          {isGuestTunnelEnabled
            ? (<Row>
              <Col span={18}>
                <Form.Item
                  name='guestEdgeClusterId'
                  label={<>
                    { $t({ defaultMessage: 'DMZ Cluster' }) }
                    <Tooltip.Question
                      title={$t(messageMappings.setting_dmz_cluster_tooltip)}
                      placement='bottom'
                    />
                  </>}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select a DMZ Cluster' })
                  },
                  { validator: (_, value) => checkCorePortConfigured(value) },
                  { validator: (_, value) => isHaAaDmzEnabled
                    ? Promise.resolve()
                    : dmzHaModeCheck(value, isGuestTunnelEnabled) }
                  ]}
                >
                  <Select
                    loading={isClusterOptsLoading}
                    options={getDmzClusterOpts()}
                    placeholder={$t({ defaultMessage: 'Select ...' })}
                    onChange={onDmzClusterChange}
                  />
                </Form.Item>
              </Col>
              {guestEdgeClusterId &&
                <Col span={24}>
                  <ClusterFirmwareInfo
                    clusterId={guestEdgeClusterId}
                  />
                </Col>
              }
            </Row>)
            : null
          }
        </SpaceWrapper>
      </Col>
      <UI.VerticalSplitLine span={1} />
      <Col span={10}>
        <UI.StyledDiagram
          isGuestTunnelEnabled={isGuestTunnelEnabled}
          vertical={true}
        />
      </Col>
    </UI.Wrapper>
  )
}

const sdLanFeatureRequirementPayload = {
  filters: {
    featureNames: ['SD-LAN']
  }
}
const ClusterFirmwareInfo = (props: {
  clusterId: string,
  fwVersion?: string,
}) => {
  const { $t } = useIntl()
  const { clusterId } = props
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const { requiredFw, isLoading } = useGetEdgeFeatureSetsQuery({
    payload: sdLanFeatureRequirementPayload }, {
    skip: !isEdgeCompatibilityEnabled,
    selectFromResult: ({ data, isLoading }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.SD_LAN)?.requiredFw,
        isLoading
      }
    }
  })

  const { nodesData, isFwVerFetching } = useGetEdgeListQuery({
    payload: {
      fields: [
        'serialNumber',
        'firmwareVersion'
      ],
      filters: { clusterId: [clusterId] }
    } }, {
    skip: !isEdgeCompatibilityEnabled,
    selectFromResult: ({ data, isFetching }) => ({
      nodesData: data?.data ?? [],
      isFwVerFetching: isFetching
    })
  })

  // eslint-disable-next-line max-len
  const edgesData = [...nodesData]?.sort((n1, n2) => compareVersions(n1.firmwareVersion, n2.firmwareVersion))
  const minNodeVersion = edgesData?.[0]?.firmwareVersion
  const isLower = !!minNodeVersion && compareVersions(minNodeVersion, requiredFw) < 0

  return isEdgeCompatibilityEnabled && !isFwVerFetching
    ? ( <Space align='center' size='small'>
      <Typography>
        {$t({ defaultMessage: 'Cluster Firmware Version: {fwVersion}' },
          { fwVersion: minNodeVersion }) }
      </Typography>
      {isLower && <Tooltip
        title={<Loader states={[{ isLoading }]}>
          {$t({ defaultMessage: `SD-LAN feature requires your RUCKUS Edge cluster
              running firmware version <b>{requiredFw}</b> or higher. You may upgrade your
              <venueSingular></venueSingular> firmware from {targetLink}` },
          {
            b: (txt) => <b>{txt}</b>,
            requiredFw,
            targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
              {$t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' })}
            </TenantLink>
          })}
        </Loader>
        }>
        <CompatibilityWarningTriangleIcon />
      </Tooltip>
      }
    </Space>)
    : null
}