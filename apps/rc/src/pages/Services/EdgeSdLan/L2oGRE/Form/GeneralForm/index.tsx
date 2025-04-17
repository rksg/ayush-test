import { useMemo } from 'react'

import { Col, Form, Input, Row, Select, Tooltip, Typography, Space } from 'antd'
import { useIntl }                                                   from 'react-intl'

import { Loader, StepsForm, useStepFormContext }           from '@acx-ui/components'
import { InformationSolid }                                from '@acx-ui/icons'
import { CompatibilityWarningTriangleIcon }                from '@acx-ui/rc/components'
import { useGetEdgeFeatureSetsQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanFormModel,
  IncompatibilityFeatures,
  servicePolicyNameRegExp,
  TunnelTypeEnum,
  useHelpPageLink
} from '@acx-ui/rc/utils'
import { TenantLink }      from '@acx-ui/react-router-dom'
import { compareVersions } from '@acx-ui/utils'

import { useEdgeSdLanContext }    from '../EdgeSdLanContextProvider'
import { messageMappings }        from '../messageMappings'
import { StyledAntdDescriptions } from '../SummaryForm/styledComponents'

import * as UI from './styledComponents'


export const GeneralForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { availableTunnelProfiles, associatedEdgeClusters } = useEdgeSdLanContext()
  const helpUrl = useHelpPageLink()
  const tunnelProfileId = Form.useWatch('tunnelProfileId', form)

  const tunnelProfileOptions = useMemo(() => {
    return availableTunnelProfiles
      .filter((tunnelProfile) => tunnelProfile.tunnelType === TunnelTypeEnum.VXLAN_GPE)
      .map((tunnelProfile) => ({
        label: tunnelProfile.name,
        value: tunnelProfile.id
      }))
  }, [availableTunnelProfiles])

  const currentTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
    tunnelProfile.id === tunnelProfileId)

  const checkCorePortConfigured = (tunnelProfileId: string) => {
    const targetTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
      tunnelProfile.id === tunnelProfileId)
    const associatedEdgeCluster = associatedEdgeClusters?.find((cluster) =>
      cluster.clusterId === targetTunnelProfile?.destinationEdgeClusterId)
    if (associatedEdgeCluster?.hasCorePort) {
      return Promise.resolve()
    } else {
      return Promise.reject(<UI.ClusterSelectorHelper>
        <InformationSolid />
        {$t(messageMappings.setting_cluster_helper, {
          infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
            {$t({ defaultMessage: 'See more information' })}
          </a>
        })}
      </UI.ClusterSelectorHelper>)
    }
  }

  const onTunnelProfileChange = (tunnelProfileId: string) => {
    const targetTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
      tunnelProfile.id === tunnelProfileId)
    form.setFieldsValue({
      edgeClusterName: targetTunnelProfile?.destinationEdgeClusterName,
      tunnelProfileName: targetTunnelProfile?.name
    })
  }

  return (
    <UI.Wrapper>
      <Col span={12}>
        <Row>
          <Col span={18}>
            <StepsForm.Title>
              {$t({ defaultMessage: 'General' })}
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
          <Col span={18}>
            <Form.Item
              name='tunnelProfileId'
              label={$t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' })}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select a Tunnel Profile' })
                },
                { validator: (_, value) => checkCorePortConfigured(value) }
              ]}
            >
              <Select
                options={tunnelProfileOptions}
                placeholder={$t({ defaultMessage: 'Select ...' })}
                onChange={onTunnelProfileChange}
                disabled={editMode}
              />
            </Form.Item>
          </Col>
        </Row>
        {
          tunnelProfileId &&
          <Row>
            <Col span={18}>
              <StyledAntdDescriptions colon={false} layout='vertical' >
                <StyledAntdDescriptions.Item
                  label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
                >
                  {currentTunnelProfile?.destinationEdgeClusterName}
                </StyledAntdDescriptions.Item>
              </StyledAntdDescriptions>
            </Col>
            <Col span={24}>
              <ClusterFirmwareInfo
                clusterId={currentTunnelProfile?.destinationEdgeClusterId ?? ''}
              />
            </Col>
          </Row>
        }
      </Col>
      <UI.VerticalSplitLine span={1} />
      <Col span={10}>
        <UI.StyledDiagram
          isGuestTunnelEnabled={false}
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

  const { requiredFw, isLoading } = useGetEdgeFeatureSetsQuery({
    payload: sdLanFeatureRequirementPayload }, {
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
    selectFromResult: ({ data, isFetching }) => ({
      nodesData: data?.data ?? [],
      isFwVerFetching: isFetching
    })
  })

  // eslint-disable-next-line max-len
  const edgesData = [...nodesData]?.sort((n1, n2) => compareVersions(n1.firmwareVersion, n2.firmwareVersion))
  const minNodeVersion = edgesData?.[0]?.firmwareVersion
  const isLower = !!minNodeVersion && compareVersions(minNodeVersion, requiredFw) < 0

  return !isFwVerFetching
    ? ( <Space align='center' size='small'>
      <Typography style={{ fontSize: '12px' }}>
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