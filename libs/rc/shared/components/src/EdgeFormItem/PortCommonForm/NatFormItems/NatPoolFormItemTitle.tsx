import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { defaultRichTextFormatValues }                            from '@acx-ui/components'
import { useGetEdgeFeatureSetsQuery, useGetEdgeListQuery }        from '@acx-ui/rc/services'
import { IncompatibilityFeatures, isEdgeMatchedRequiredFirmware } from '@acx-ui/rc/utils'
import { TenantLink }                                             from '@acx-ui/react-router-dom'

import { CompatibilityWarningTriangleIcon } from '../../../Compatibility/styledComponents'

export const NatPoolFormItemTitle = (props: {
  serialNumber: string | undefined,
}) => {
  const { $t } = useIntl()
  const { serialNumber } = props

  const { requiredFw } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.MULTI_NAT_IP]
      } }
  }, {
    selectFromResult: ({ data }) => ({
      requiredFw: data?.featureSets
        ?.find(item =>
          item.featureName === IncompatibilityFeatures.MULTI_NAT_IP)?.requiredFw
    })
  })

  const { data: edgeData } = useGetEdgeListQuery(
    { payload: {
      fields: [
        'serialNumber',
        'venueId',
        'clusterId',
        'firmwareVersion'
      ],
      filters: { serialNumber: [serialNumber] }
    } }, {
      skip: !serialNumber
    })

  // eslint-disable-next-line max-len
  const isLower = requiredFw && !!edgeData?.data?.length && !isEdgeMatchedRequiredFirmware(requiredFw, edgeData.data.slice(0, 1))

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