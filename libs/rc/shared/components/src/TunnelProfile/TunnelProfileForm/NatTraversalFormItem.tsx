import { Form, Tooltip, Switch } from 'antd'
import { useIntl }               from 'react-intl'

import { getTitleWithBetaIndicator }                                              from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled }                               from '@acx-ui/feature-toggle'
import { IncompatibilityFeatures, NetworkSegmentTypeEnum, useIsEdgeFeatureReady } from '@acx-ui/rc/utils'

import { ApCompatibilityToolTip } from '../../ApCompatibility'

import { MessageMapping } from './MessageMapping'
import * as UI            from './styledComponents'

interface NatTraversalFormItemProps {
  setEdgeCompatibilityFeature: (feature: IncompatibilityFeatures) => void
  isDefaultTunnelProfile?: boolean
}
export const NatTraversalFormItem = (props: NatTraversalFormItemProps) => {
  const { $t } = useIntl()
  const isNatTraversalBetaEnabled = useIsBetaEnabled(TierFeatures.EDGE_NAT_T)
  const isEdgeIpsecVxLanReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  const { setEdgeCompatibilityFeature, isDefaultTunnelProfile = false } = props
  const form = Form.useFormInstance()
  const disabledFields = form.getFieldValue('disabledFields')

  return <UI.StyledSpace align='center'>
    <UI.FormItemWrapper
      label={<>
        {$t({ defaultMessage: 'Enable NAT-T Support' })}
        { isNatTraversalBetaEnabled ? getTitleWithBetaIndicator('') : null }
        {<ApCompatibilityToolTip
          title={$t(MessageMapping.nat_traversal_support_tooltip)}
          placement='bottom'
          showDetailButton
          // eslint-disable-next-line max-len
          onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.NAT_TRAVERSAL)}
        />}
      </>}
    >
    </UI.FormItemWrapper>
    <Form.Item
      noStyle
      dependencies={['type', 'tunnelEncryptionEnabled']}
    >
      {({ getFieldValue }) => {
        const netSegType = getFieldValue('type')
        // eslint-disable-next-line max-len
        const tunnelEncryptionEnabled = isEdgeIpsecVxLanReady && getFieldValue('tunnelEncryptionEnabled')

        const disabled = isDefaultTunnelProfile ||
                        !!disabledFields?.includes('natTraversalEnabled') ||
                        tunnelEncryptionEnabled ||
                        netSegType === NetworkSegmentTypeEnum.VXLAN

        const getDisableReason = () => {
          if (!disabled) return undefined

          if (isDefaultTunnelProfile)
            return $t({ defaultMessage: 'Default tunnel profile is not supported' })

          if (tunnelEncryptionEnabled) {
            // eslint-disable-next-line max-len
            return $t({ defaultMessage: 'When tunnel encryption is enabled, NAT-T must be turned on.' })
          }

          if(netSegType === NetworkSegmentTypeEnum.VXLAN)
            return $t({ defaultMessage: 'Network segment type is VNI is not supported' })

          return undefined
        }

        return <Tooltip title={disabled ? getDisableReason() : undefined}>
          <Form.Item
            name='natTraversalEnabled'
            valuePropName='checked'
            children={<Switch disabled={disabled} />}
          />
        </Tooltip>
      }}
    </Form.Item>
  </UI.StyledSpace>
}