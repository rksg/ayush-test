import { ReactNode } from 'react'

import { Space, Tooltip, Typography } from 'antd'
import { cloneDeep }                  from 'lodash'
import { useIntl }                    from 'react-intl'

import { Loader }                                                      from '@acx-ui/components'
import { useGetEdgeFeatureSetsQuery, useGetEdgeListQuery }             from '@acx-ui/rc/services'
import { getCompatibilityFeatureDisplayName, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { TenantLink }                                                  from '@acx-ui/react-router-dom'
import { compareVersions }                                             from '@acx-ui/utils'

import { CompatibilityWarningTriangleIcon } from '../../Compatibility/styledComponents'

interface EdgeClusterFirmwareInfoProps {
  featureName: IncompatibilityFeatures
  clusterId: string
  message?: string | ((requiredFw: string | undefined) => ReactNode)
}

export const EdgeClusterFirmwareInfo = (props: EdgeClusterFirmwareInfoProps) => {
  const { $t } = useIntl()
  const { featureName, clusterId, message } = props

  const { requiredFw, isLoading } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [featureName]
      } }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === featureName)?.requiredFw,
        isLoading
      }
    }
  })

  const { nodesData, isFwVerLoading } = useGetEdgeListQuery({
    payload: {
      fields: [
        'serialNumber',
        'firmwareVersion'
      ],
      filters: { clusterId: [clusterId] }
    } }, {
    selectFromResult: ({ data, isLoading }) => ({
      nodesData: data?.data ?? [],
      isFwVerLoading: isLoading
    })
  })

  // eslint-disable-next-line max-len
  const edgesData = cloneDeep(nodesData).sort((n1, n2) => compareVersions(n1.firmwareVersion, n2.firmwareVersion))
  const minNodeVersion = edgesData?.[0]?.firmwareVersion
  const isLower = !!minNodeVersion && compareVersions(minNodeVersion, requiredFw) < 0

  return !isFwVerLoading
    ? ( <Space align='center' size='small'>
      <Typography>
        {$t({ defaultMessage: 'Cluster Firmware Version: {fwVersion}' },
          { fwVersion: minNodeVersion }) }
      </Typography>
      {isLower && <Tooltip
        title={<Loader states={[{ isLoading }]}>
          {message
            ? (typeof message === 'string' ? message : message(requiredFw))
            : $t({ defaultMessage: `{featureName} feature requires your RUCKUS Edge cluster
              running firmware version <b>{requiredFw}</b> or higher. You may upgrade your
              <venueSingular></venueSingular> firmware from {targetLink}` },
            {
              featureName: getCompatibilityFeatureDisplayName(featureName),
              b: (txt) => <b>{txt}</b>,
              requiredFw,
              targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
                {
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' })
                }
              </TenantLink>
            })}
        </Loader>
        }>
        <CompatibilityWarningTriangleIcon />
      </Tooltip>}
    </Space>)
    : null
}