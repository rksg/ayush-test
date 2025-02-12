import { useState } from 'react'

import { Col, Divider, Row, Space } from 'antd'
import moment                       from 'moment'
import { useIntl }                  from 'react-intl'

import { Button, Loader }                     from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { DateFormatEnum, userDateTimeFormat } from '@acx-ui/formatter'
import { useMspCustomerListQuery }            from '@acx-ui/msp/services'
import {
  ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
  AccessControlSubPolicyVisibility,
  isAccessControlSubPolicy,
  renderConfigTemplateDetailsComponent,
  subPolicyMappingType
} from '@acx-ui/rc/components'
import { ConfigTemplate, ConfigTemplateDriftType, PolicyType } from '@acx-ui/rc/utils'

import { ShowDriftsDrawer }                                      from '../ShowDriftsDrawer'
import { ConfigTemplateDriftStatus, getConfigTemplateTypeLabel } from '../templateUtils'
import { useEcFilters }                                          from '../templateUtils'

import * as UI from './styledComponents'


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

  const basicDetails = [
    {
      label: $t({ defaultMessage: 'Template Name' }),
      // eslint-disable-next-line max-len
      value: <TemplateNameLink template={template} setAclSubPolicyVisible={setAccessControlSubPolicyVisible} />
    },
    {
      label: $t({ defaultMessage: 'Type' }),
      value: getConfigTemplateTypeLabel(template.type)
    },
    ...(driftsEnabled ? [{
      label: $t({ defaultMessage: 'Drift Status' }),
      value: <ConfigTemplateDriftStatus row={template}
        callbackMap={{
          [ConfigTemplateDriftType.DRIFT_DETECTED]: () => setShowDriftsDrawerVisible(true)
        }}
      />
    }] : [])
  ]

  const metadataDetails = [
    { label: $t({ defaultMessage: 'Created By' }), value: template.createdBy },
    {
      label: $t({ defaultMessage: 'Created On' }),
      value: moment(template.createdOn).format(dateFormat)
    },
    {
      label: $t({ defaultMessage: 'Last Modified' }),
      value: moment(template.lastModified).format(dateFormat)
    },
    {
      label: $t({ defaultMessage: 'Last Applied' }),
      value: template.lastApplied ? moment(template.lastApplied).format(dateFormat) : ''
    }
  ]

  return <>
    <Space split={<Divider style={{ margin: '4px 0' }} />} direction='vertical' size={8}>
      <UI.DetailBlock>
        {basicDetails.map(detail => <DetailRow key={detail.label} {...detail} />)}
      </UI.DetailBlock>
      <UI.DetailBlock>
        {metadataDetails.map(detail => <DetailRow key={detail.label} {...detail} />)}
      </UI.DetailBlock>
      <AppliedToTenantList appliedOnTenants={template.appliedOnTenants} />
    </Space>
    {showDriftsDrawerVisible &&
      <ShowDriftsDrawer
        setVisible={setShowDriftsDrawerVisible}
        selectedTemplate={template}
      />}
  </>
}

function DetailRow ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Row gutter={16}>
      <Col span={8} style={{ fontWeight: 600 }}>{label}</Col>
      <Col span={16}>{value}</Col>
    </Row>
  )
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
    <span style={{ fontWeight: 600 }}>{ $t({ defaultMessage: 'Applied to' })}</span>
    <Loader states={[{ isLoading }]} style={{ width: '100%', backgroundColor: 'transparent' }}>
      <Space direction='vertical' size={4}>
        {data?.data.map(mspEcTenant => <div key={mspEcTenant.id}>{mspEcTenant.name}</div>)}
      </Space>
    </Loader>
  </Space>
}

interface TemplateNameLinkProps {
  template: ConfigTemplate
  setAclSubPolicyVisible: (visibility: AccessControlSubPolicyVisibility) => void
}
function TemplateNameLink (props: TemplateNameLinkProps) {
  const { template, setAclSubPolicyVisible } = props

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
      {template.name}
    </Button>
  }
  return renderConfigTemplateDetailsComponent(template.type, template.id!, template.name)
}
