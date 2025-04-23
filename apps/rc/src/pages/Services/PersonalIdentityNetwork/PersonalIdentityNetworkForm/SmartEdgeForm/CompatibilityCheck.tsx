import { useMemo } from 'react'

import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { defaultRichTextFormatValues, Tooltip }              from '@acx-ui/components'
import { compareVersions, CompatibilityWarningTriangleIcon } from '@acx-ui/rc/components'
import { useGetEdgeFeatureSetsQuery }                        from '@acx-ui/rc/services'
import { EdgeClusterStatus, IncompatibilityFeatures }        from '@acx-ui/rc/utils'
import { TenantLink }                                        from '@acx-ui/react-router-dom'

interface CompatibilityCheckProps {
  clusterData?: EdgeClusterStatus
}

export const CompatibilityCheck = (props: CompatibilityCheckProps) => {
  const { clusterData } = props
  const { $t } = useIntl()

  const { requiredFw } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: ['PIN']
      }
    } }, {
    selectFromResult: ({ data }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.PIN)?.requiredFw
      }
    }
  })

  const edgesData = useMemo(() => {
    const newClusterData = cloneDeep(clusterData)
    return newClusterData?.edgeList?.sort((n1, n2) =>
      compareVersions(n1.firmwareVersion, n2.firmwareVersion))
  }, [clusterData?.clusterId])
  const minNodeVersion = edgesData?.[0]?.firmwareVersion
  const isLower = !!minNodeVersion && compareVersions(minNodeVersion, requiredFw) < 0

  return isLower ? <Tooltip
    title={
      <>
        {$t({ defaultMessage: `Firmware Version: <b>{currentFw}</b><br></br>
                  PIN feature requires your RUCKUS Edge cluster
                  running firmware version <b>{requiredFw}</b> or higher. You may upgrade your
                  <venueSingular></venueSingular> firmware from {targetLink}` },
        {
          ...defaultRichTextFormatValues,
          currentFw: minNodeVersion,
          requiredFw,
          targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
            {/* eslint-disable-next-line max-len*/}
            {$t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' })}
          </TenantLink>
        })}
      </>
    }>
    <CompatibilityWarningTriangleIcon />
  </Tooltip> : <></>
}