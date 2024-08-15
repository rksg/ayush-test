import { useEffect } from 'react'

import { Select,Col, Form, Input, Row, Switch, Space, Typography } from 'antd'
import { findIndex, find }                                         from 'lodash'
import { useIntl }                                                 from 'react-intl'
import { useParams }                                               from 'react-router-dom'

import {  StepsForm, Tooltip, useStepFormContext, Loader } from '@acx-ui/components'
import { InformationSolid }                                from '@acx-ui/icons'
import { SpaceWrapper }                                    from '@acx-ui/rc/components'
import {
  useGetEdgeClusterListQuery,
  useGetEdgeFeatureSetsQuery
} from '@acx-ui/rc/services'
import {
  servicePolicyNameRegExp,
  useHelpPageLink,
  EdgeMvSdLanFormModel,
  ClusterHighAvailabilityModeEnum,
  EdgeFeatureEnum
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { useEdgeMvSdLanContext } from '../EdgeMvSdLanContextProvider'
import { messageMappings }       from '../messageMappings'

import * as UI from './styledComponents'

export const SettingsForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { form, editMode, initialValues } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { allSdLans } = useEdgeMvSdLanContext()

  const edgeClusterId = Form.useWatch('edgeClusterId', form)
  const guestEdgeClusterId = Form.useWatch('guestEdgeClusterId', form)
  const isGuestTunnelEnabled = Form.useWatch('isGuestTunnelEnabled', form)

  const helpUrl = useHelpPageLink()

  const sdLanBoundEdges = allSdLans.filter(item => item.id !== params.serviceId)
    .flatMap(item => [item.edgeClusterId, item.guestEdgeClusterId])
    .filter(val => !!val)

  const filterSn = editMode ? [initialValues?.edgeClusterId] : []
  if (editMode && initialValues?.guestEdgeClusterId)
    filterSn.push(initialValues?.guestEdgeClusterId)

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
      ...(filterSn.length === 2
        ? { filters: { clusterId: filterSn } }
        : { pageSize: 10000 })
    } },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterData: data?.data
            .filter(item => sdLanBoundEdges.indexOf(item.clusterId!) === -1),
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

  useEffect(() => {
    if (!editMode) {
      if ((isGuestTunnelEnabled && guestEdgeClusterId) || (!isGuestTunnelEnabled && edgeClusterId))
        form.validateFields(isGuestTunnelEnabled
          ? ['edgeClusterId', 'guestEdgeClusterId']
          : ['edgeClusterId'])
    }
  }, [isGuestTunnelEnabled, editMode, edgeClusterId, guestEdgeClusterId])

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
    if (findIndex(clusterData, { clusterId, hasCorePort: true }) !== -1) {
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

  // eslint-disable-next-line max-len
  const checkHAModeConsist = (dcClusterId: string, dmzClusterId: string | undefined, isGuestTunnelOn: boolean) => {
    const dcClusterHaMode = find(clusterData, { clusterId: dcClusterId })
      ?.highAvailabilityMode ?? ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY
    const dmzClusterHaMode = find(clusterData, { clusterId: dmzClusterId })
      ?.highAvailabilityMode ?? ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY

    if (!isGuestTunnelOn || !dmzClusterId || dcClusterHaMode === dmzClusterHaMode) {
      return Promise.resolve()
    } else
      return Promise.reject($t({ defaultMessage: 'High availability mode must be consistent.' }))
  }

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
                    dependencies={['guestEdgeClusterId']}
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please select a Cluster' })
                    },
                    { validator: (_, value) => checkCorePortConfigured(value) },
                    ({ getFieldValue }) => ({
                      validator: (_, value) => {
                        const guestEdgeClusterId = getFieldValue('guestEdgeClusterId')
                        // eslint-disable-next-line max-len
                        return checkHAModeConsist(value, guestEdgeClusterId, isGuestTunnelEnabled)
                      }
                    })
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
                <ClusterFirmwareInfo
                  fwVersion={find(clusterData, { clusterId: edgeClusterId })?.firmwareVersion} />
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
                  dependencies={['edgeClusterId']}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select a DMZ Cluster' })
                  },
                  { validator: (_, value) => checkCorePortConfigured(value) },
                  ({ getFieldValue }) => ({
                    validator: (_, value) => {
                      const edgeClusterId = getFieldValue('edgeClusterId')
                      return checkHAModeConsist(edgeClusterId, value, true)
                    }
                  }) ]}
                >
                  <Select
                    loading={isClusterOptsLoading}
                    options={clusterOptions?.filter(item => item.value !== edgeClusterId)}
                    placeholder={$t({ defaultMessage: 'Select ...' })}
                    disabled={editMode && !!initialValues?.guestEdgeClusterId}
                    onChange={onDmzClusterChange}
                  />
                </Form.Item>
              </Col>
              <ClusterFirmwareInfo
                fwVersion={find(clusterData, { clusterId: guestEdgeClusterId })?.firmwareVersion} />
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
  fwVersion?: string
}) => {
  const { $t } = useIntl()
  const { fwVersion } = props

  const { requiredFw, isLoading } = useGetEdgeFeatureSetsQuery({
    payload: sdLanFeatureRequirementPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === EdgeFeatureEnum.SD_LAN)?.requiredFw,
        isLoading
      }
    }
  })
  return (
    <Space>
      <Typography>
        {$t({ defaultMessage: 'Cluster Firmware Verson: {fwVersion}' },
          { fwVersion }) }
      </Typography>
      <Tooltip
        title={<Loader states={[{ isLoading }]}>
          {$t({ defaultMessage: `SD-LAN feature requires your SmartEdge cluster 
        running firmware version {requiredFw} or higher.
        You may upgrade your venue firmware
        from {targetLink}` },
          {
            requiredFw,
            targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
              {$t({ defaultMessage: 'Administration > Version Management > SmartEdge Firmware' })}
            </TenantLink>
          })}</Loader>}>
        <InformationSolid />
      </Tooltip>
    </Space>
  )
}