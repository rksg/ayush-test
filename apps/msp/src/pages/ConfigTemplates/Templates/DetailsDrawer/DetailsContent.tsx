import { useState } from 'react'

import { Divider, Space, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { cssStr, Descriptions, GridCol, GridRow, Loader }              from '@acx-ui/components'
import { Features, useIsSplitOn }                                      from '@acx-ui/feature-toggle'
import { useMspCustomerListQuery }                                     from '@acx-ui/msp/services'
import { AccessControlSubPolicyVisibility }                            from '@acx-ui/rc/components'
import { ConfigTemplate, ConfigTemplateDriftType, ConfigTemplateType } from '@acx-ui/rc/utils'
import { noDataDisplay }                                               from '@acx-ui/utils'

import { ShowDriftsDrawer }                                                                                                                               from '../ShowDriftsDrawer'
import { ConfigTemplateDriftStatus, getConfigTemplateEnforcementLabel, getConfigTemplateTypeLabel, useFormatTemplateDate, ViewConfigTemplateDetailsLink } from '../templateUtils'
import { useEcFilters }                                                                                                                                   from '../templateUtils'

import { ProtectedActivationViewer, ApGroupVenueViewer } from './ActivationViewer'

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
  const shouldShowApGroupVenue = useIsSplitOn(Features.CONFIG_TEMPLATE_DISPLAYABLE_ACTIVATION)
    && template.type === ConfigTemplateType.AP_GROUP

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
      {shouldShowApGroupVenue && <Descriptions.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={<ApGroupVenueViewer templateId={template.id!} />}
      />}
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
    <GridRow>
      <GridCol col={{ span: 12 }}>
        <AppliedToTenantList appliedOnTenants={template.appliedOnTenants} />
      </GridCol>
      <GridCol col={{ span: 12 }}>
        <ProtectedActivationViewer type={template.type} templateId={template.id!} />
      </GridCol>
    </GridRow>
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

  return <DetailsItemList
    title={$t({ defaultMessage: 'Applied to' })}
    items={data?.data.map(mspEcTenant => mspEcTenant.name) || []}
    isLoading={isLoading}
  />
}

export interface DetailsItemListProps {
  title: string
  items: string[]
  isLoading?: boolean
}

export function DetailsItemList ({ title, items = [], isLoading = false }: DetailsItemListProps) {
  const sortedItems = [...items].sort((a, b) => a.localeCompare(b))

  return <Space direction='vertical' size={6}>
    <span style={{ fontWeight: 700, color: cssStr('--acx-neutrals-60') }}>
      { title }
    </span>
    <Loader states={[{ isLoading }]} style={{ width: '100%', backgroundColor: 'transparent' }}>
      <Space direction='vertical' size={4}>
        {sortedItems.length > 0 ? sortedItems.map(item => (
          <Typography.Text ellipsis key={item}>{item}</Typography.Text>
        )) : noDataDisplay}
      </Space>
    </Loader>
  </Space>
}