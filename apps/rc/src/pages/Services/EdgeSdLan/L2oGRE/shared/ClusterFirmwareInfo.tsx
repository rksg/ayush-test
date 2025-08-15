import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Loader, Tooltip }                                 from '@acx-ui/components'
import { CompatibilityWarningTriangleIcon }                from '@acx-ui/rc/components'
import { useGetEdgeFeatureSetsQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { IncompatibilityFeatures }                         from '@acx-ui/rc/utils'
import { TenantLink }                                      from '@acx-ui/react-router-dom'
import { compareVersions }                                 from '@acx-ui/utils'

const sdLanFeatureRequirementPayload = {
  filters: {
    featureNames: ['SD-LAN']
  }
}

export const ClusterFirmwareInfo = (props: {
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