import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { defaultRichTextFormatValues }                      from '@acx-ui/components'
import { EdgeClusterStatus, isEdgeMatchedRequiredFirmware } from '@acx-ui/rc/utils'
import { TenantLink }                                       from '@acx-ui/react-router-dom'

import { CompatibilityWarningTriangleIcon } from '../../../Compatibility/styledComponents'

export const NatPoolFormItemTitle = (props: {
  serialNumber: string | undefined,
  clusterInfo: EdgeClusterStatus,
  requiredFw: string | undefined,
}) => {
  const { $t } = useIntl()
  const { serialNumber, clusterInfo, requiredFw } = props

  const edgeData = clusterInfo.edgeList?.find(item => item.serialNumber === serialNumber)

  // eslint-disable-next-line max-len
  const isLower = requiredFw && !!edgeData && !isEdgeMatchedRequiredFirmware(requiredFw, [edgeData])

  return <>{$t({ defaultMessage: 'NAT IP Addresses Range' })}
    {isLower && <Tooltip
      // eslint-disable-next-line max-len
      title={$t({ defaultMessage: `Multiple NAT IP addresses feature requires your RUCKUS Edge cluster
          running firmware version <b>{requiredFw}</b> or higher. You may upgrade your
          <venueSingular></venueSingular> firmware from {targetLink}` },
      {
        ...defaultRichTextFormatValues,
        requiredFw,
        targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
          {$t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' })}
        </TenantLink>
      })
      }>
      <CompatibilityWarningTriangleIcon />
    </Tooltip>
    }
  </>
}