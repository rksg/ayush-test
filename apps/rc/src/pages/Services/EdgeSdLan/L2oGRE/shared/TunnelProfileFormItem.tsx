import { ReactNode, useMemo } from 'react'

import { Form }       from 'antd'
import { RuleObject } from 'antd/lib/form'
import { useIntl }    from 'react-intl'

import { Select, SelectProps }                                                       from '@acx-ui/components'
import { InformationSolid }                                                          from '@acx-ui/icons'
import { EdgeClusterStatus, TunnelProfileViewData, TunnelTypeEnum, useHelpPageLink } from '@acx-ui/rc/utils'

import { messageMappings }       from '../Form/messageMappings'
import { ClusterSelectorHelper } from '../styledComponents'

export const tunnelProfileFieldName = 'tunnelProfileId'
export const tunnelTemplateFieldName = 'tunnelTemplateId'

interface TunnelProfileFormItemProps {
  name: typeof tunnelProfileFieldName | typeof tunnelTemplateFieldName
  label?: ReactNode
  onChange?: SelectProps['onChange']
  disabled?: SelectProps['disabled']
  tunnelProfiles?: TunnelProfileViewData[]
  associatedEdgeClusters?: EdgeClusterStatus[]
}

export const TunnelProfileFormItem = (props: TunnelProfileFormItemProps) => {
  const { name, label, onChange, disabled, tunnelProfiles, associatedEdgeClusters } = props
  const { $t } = useIntl()
  const helpUrl = useHelpPageLink()

  const options = useMemo(() => {
    return tunnelProfiles
      ?.filter((tunnelProfile) => tunnelProfile.tunnelType === TunnelTypeEnum.VXLAN_GPE)
      .map((tunnelProfile) => ({
        label: tunnelProfile.name,
        value: tunnelProfile.id
      }))
  }, [tunnelProfiles])

  const ruleMap = useMemo(() => {
    return {
      [tunnelProfileFieldName]: [
        {
          required: true,
          message: $t({ defaultMessage: 'Please select a Tunnel Profile' })
        },
        { validator: (_: RuleObject, value: string) => checkCorePortConfigured(value) }
      ],
      [tunnelTemplateFieldName]: [
        {
          required: true,
          message: $t({ defaultMessage: 'Please select a Tunnel Profile Template' })
        },
        { validator: (_: RuleObject, value: string) => checkCorePortConfigured(value) }
      ]
    }
  }, [])

  const checkCorePortConfigured = (value: string) => {
    const targetTunnelProfile = tunnelProfiles?.find((tunnelProfile) =>
      tunnelProfile.id === value)
    const associatedEdgeCluster = associatedEdgeClusters?.find((cluster) =>
      cluster.clusterId === targetTunnelProfile?.destinationEdgeClusterId)
    if (associatedEdgeCluster?.hasCorePort) {
      return Promise.resolve()
    } else {
      return Promise.reject(<ClusterSelectorHelper>
        <InformationSolid />
        {$t(messageMappings.setting_cluster_helper, {
          infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
            {$t({ defaultMessage: 'See more information' })}
          </a>
        })}
      </ClusterSelectorHelper>)
    }
  }

  return <Form.Item
    name={name}
    label={label}
    // rules={ruleMap[name]}
    validateFirst
  >
    <Select
      options={options}
      placeholder={$t({ defaultMessage: 'Select ...' })}
      onChange={onChange}
      disabled={disabled}
    />
  </Form.Item>
}