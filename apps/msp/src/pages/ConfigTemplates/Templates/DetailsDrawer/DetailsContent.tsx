import { useState } from 'react'

import { Divider, Space } from 'antd'
import moment             from 'moment'
import { useIntl }        from 'react-intl'

import { Button, cssStr, Descriptions, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { DateFormatEnum, userDateTimeFormat }   from '@acx-ui/formatter'
import { useMspCustomerListQuery }              from '@acx-ui/msp/services'
import {
  ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
  AccessControlSubPolicyVisibility,
  isAccessControlSubPolicy,
  renderConfigTemplateDetailsComponent,
  subPolicyMappingType
} from '@acx-ui/rc/components'
import { ConfigTemplate, ConfigTemplateDriftType, PolicyType } from '@acx-ui/rc/utils'

import { ShowDriftsDrawer }                                                                         from '../ShowDriftsDrawer'
import { ConfigTemplateDriftStatus, getConfigTemplateEnforcementLabel, getConfigTemplateTypeLabel } from '../templateUtils'
import { useEcFilters }                                                                             from '../templateUtils'

interface DetailsContentProps {
  template: ConfigTemplate
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
}

export function DetailsContent (props: DetailsContentProps) {
  const { $t } = useIntl()
  const { template, setAccessControlSubPolicyVisible } = props
  const dateFormat = userDateTimeFormat(DateFormatEnum.DateTimeFormatWithSeconds)
  const [ showDriftsDrawerVisible, setShowDriftsDrawerVisible ] = useState(false)
  const driftsEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_DRIFTS)
  const enforcementEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)

  return <>
    <Descriptions labelWidthPercent={35}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Template Name' })}
        children={template.name}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Type' })}
        children={getConfigTemplateTypeLabel(template.type)}
      />
      {driftsEnabled && <Descriptions.Item
        label={$t({ defaultMessage: 'Drift Status' })}
        children={<ConfigTemplateDriftStatus row={template}
          callbackMap={{
            [ConfigTemplateDriftType.DRIFT_DETECTED]: () => setShowDriftsDrawerVisible(true)
          }}
        />}
      />}
      {enforcementEnabled && <Descriptions.Item
        label={$t({ defaultMessage: 'Enforcement' })}
        children={getConfigTemplateEnforcementLabel(template.isEnforced)}
      />}
    </Descriptions>
    <Divider/>
    <Descriptions labelWidthPercent={35}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Created By' })}
        children={template.createdBy}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Created On' })}
        children={moment(template.createdOn).format(dateFormat)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Modified' })}
        children={moment(template.lastModified).format(dateFormat)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Applied' })}
        children={template.lastApplied ? moment(template.lastApplied).format(dateFormat) : ''}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Configuration Details' })}
        children={<ViewDetailsLink
          template={template}
          setAclSubPolicyVisible={setAccessControlSubPolicyVisible}
        />}
      />
    </Descriptions>
    <Divider/>
    <AppliedToTenantList appliedOnTenants={template.appliedOnTenants} />
    {showDriftsDrawerVisible &&
      <ShowDriftsDrawer
        setVisible={setShowDriftsDrawerVisible}
        selectedTemplate={template}
      />}
  </>
}

function AppliedToTenantList ({ appliedOnTenants }: { appliedOnTenants?: string[] }) {
  const { $t } = useIntl()

  const mspEcTenantsPayload = {
    filters: {
      ...useEcFilters(),
      id: appliedOnTenants
    },
    fields: ['id', 'name']
  }

  const { data, isLoading } = useMspCustomerListQuery(
    { params: {}, payload: mspEcTenantsPayload },
    { skip: !appliedOnTenants?.length }
  )

  return <Space direction='vertical' size={6}>
    <span style={{ fontWeight: 700, color: cssStr('--acx-neutrals-60') }}>
      { $t({ defaultMessage: 'Applied to' })}
    </span>
    <Loader states={[{ isLoading }]} style={{ width: '100%', backgroundColor: 'transparent' }}>
      <Space direction='vertical' size={4}>
        {data?.data.map(mspEcTenant => <div key={mspEcTenant.id}>{mspEcTenant.name}</div>)}
      </Space>
    </Loader>
  </Space>
}

interface ViewDetailsLinkProps {
  template: ConfigTemplate
  setAclSubPolicyVisible: (visibility: AccessControlSubPolicyVisibility) => void
}
function ViewDetailsLink (props: ViewDetailsLinkProps) {
  const { $t } = useIntl()
  const { template, setAclSubPolicyVisible } = props
  const label = $t({ defaultMessage: 'View Configuration' })

  if (isAccessControlSubPolicy(template.type)) {
    return <Button
      type='link'
      size={'small'}
      onClick={() => {
        setAclSubPolicyVisible({
          ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
          [subPolicyMappingType[template.type] as PolicyType]: {
            id: template.id,
            visible: true,
            drawerViewMode: true
          }
        })
      }}>
      {label}
    </Button>
  }
  return renderConfigTemplateDetailsComponent(template.type, template.id!, label)
}
