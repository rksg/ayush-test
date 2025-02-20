import { useState } from 'react'

import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { cssStr, Descriptions, Loader }            from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { useMspCustomerListQuery }                 from '@acx-ui/msp/services'
import { AccessControlSubPolicyVisibility }        from '@acx-ui/rc/components'
import { ConfigTemplate, ConfigTemplateDriftType } from '@acx-ui/rc/utils'
import { noDataDisplay }                           from '@acx-ui/utils'

import { ShowDriftsDrawer }                                                                                                                               from '../ShowDriftsDrawer'
import { ConfigTemplateDriftStatus, getConfigTemplateEnforcementLabel, getConfigTemplateTypeLabel, useFormatTemplateDate, ViewConfigTemplateDetailsLink } from '../templateUtils'
import { useEcFilters }                                                                                                                                   from '../templateUtils'

interface DetailsContentProps {
  template: ConfigTemplate
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
}

export function DetailsContent (props: DetailsContentProps) {
  const { $t } = useIntl()
  const { template, setAccessControlSubPolicyVisible } = props
  const dateFormatter = useFormatTemplateDate()
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
        children={dateFormatter(template.createdOn)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Modified' })}
        children={dateFormatter(template.lastModified)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Applied' })}
        children={dateFormatter(template.lastApplied)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Configuration Details' })}
        children={<ViewConfigTemplateDetailsLink
          template={template}
          setAclSubPolicyVisible={setAccessControlSubPolicyVisible}
          label={$t({ defaultMessage: 'View Configuration' })}
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
        {!appliedOnTenants?.length && noDataDisplay}
        {data?.data.map(mspEcTenant => <div key={mspEcTenant.id}>{mspEcTenant.name}</div>)}
      </Space>
    </Loader>
  </Space>
}


