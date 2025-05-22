import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, PageHeader, SummaryCard, Tabs }                                                                                                                           from '@acx-ui/components'
import { caTypeShortLabel, CertificateTable }                                                                                                                                      from '@acx-ui/rc/components'
import { useGetAdaptivePolicySetQuery, useGetCertificateTemplateQuery, useGetPersonaGroupByIdQuery, useGetSpecificTemplateCertificatesQuery, useGetSpecificTemplateScepKeysQuery } from '@acx-ui/rc/services'
import { CertificateUrls, PolicyOperation, PolicyType, filterByAccessForServicePolicyMutation, getPolicyDetailsLink, usePolicyListBreadcrumb, getScopeKeyByPolicy, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                                              from '@acx-ui/react-router-dom'
import { getOpsApi, noDataDisplay }                                                                                                                                                from '@acx-ui/utils'

import { Section } from '../styledComponents'

import ChromebookTab from './ChromebookTab'
import ScepTable     from './ScepTable'

enum TabKeyType {
  CERTIFICATE = 'certificate',
  SCEP = 'scep',
  CHROMEBOOK = 'chromebook'
}

export default function CertificateTemplateDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<TabKeyType>(TabKeyType.CERTIFICATE)
  const certificate = useGetSpecificTemplateCertificatesQuery({
    params: { templateId: params.policyId },
    payload: { pageSize: 1, page: 1 }
  })
  const scepKey = useGetSpecificTemplateScepKeysQuery({
    params: { templateId: params.policyId, pageSize: '1', page: '0' }
  })
  const { data: certificateTemplateData, isLoading } = useGetCertificateTemplateQuery({ params })
  const { policySetName } = useGetAdaptivePolicySetQuery(
    { params: { policySetId: certificateTemplateData?.policySetId } },
    {
      skip: !certificateTemplateData?.policySetId,
      selectFromResult: ({ data }) => ({
        policySetName: data?.name || certificateTemplateData?.policySetId
      })
    })
  const { identityGroupName } = useGetPersonaGroupByIdQuery(
    { params: { groupId: certificateTemplateData?.identityGroupId } },
    {
      skip: !certificateTemplateData?.identityGroupId,
      selectFromResult: ({ data }) => ({
        identityGroupName: data?.name || certificateTemplateData?.identityGroupId
      })
    })
  const certificateTableQuery = useTableQuery({
    useQuery: useGetSpecificTemplateCertificatesQuery,
    defaultPayload: {},
    apiParams: { templateId: certificateTemplateData?.id! },
    option: {
      skip: !certificateTemplateData?.id
    }
  })

  const summaryInfo = [
    {
      title: $t({ defaultMessage: 'CA Type' }),
      content: certificateTemplateData
        ? $t(caTypeShortLabel[certificateTemplateData.caType as keyof typeof caTypeShortLabel])
        : noDataDisplay,
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'Certificate Authority' }),
      content: certificateTemplateData?.onboard?.certificateAuthorityName,
      colSpan: 4
    },
    {
      title: $t({ defaultMessage: 'Identity Group' }),
      content: identityGroupName || certificateTemplateData?.identityGroupId || noDataDisplay,
      colSpan: 4
    },
    {
      title: $t({ defaultMessage: 'Adaptive Policy Set' }),
      content: policySetName || certificateTemplateData?.policySetId || noDataDisplay,
      colSpan: 4
    }
  ]

  const tabMapping = {
    [TabKeyType.CERTIFICATE]: <CertificateTable
      tableQuery={certificateTableQuery}
      templateData={certificateTemplateData}
      showGenerateCert={true} />,
    [TabKeyType.SCEP]: <ScepTable templateId={certificateTemplateData?.id}/>,
    [TabKeyType.CHROMEBOOK]: <ChromebookTab data={certificateTemplateData} />
  }

  const tabTitle = {
    [TabKeyType.CERTIFICATE]: $t({ defaultMessage: 'Certificate ({count})' },
      { count: certificate.data?.totalCount || 0 }),
    [TabKeyType.SCEP]: $t({ defaultMessage: 'SCEP Keys ({count})' },
      { count: scepKey.data?.totalCount || 0 }),
    [TabKeyType.CHROMEBOOK]: $t({ defaultMessage: 'Chromebook Enrollment' })
  }

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={certificateTemplateData?.name}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.CERTIFICATE_TEMPLATE)}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.CERTIFICATE_TEMPLATE,
              oper: PolicyOperation.EDIT,
              policyId: params.policyId!
            })}
            scopeKey={getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT)}
            rbacOpsIds={[getOpsApi(CertificateUrls.editCertificateTemplate)]}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
        footer={<>
          <Section style={{ paddingTop: '12px' }}>
            <SummaryCard data={summaryInfo} />
          </Section>
          <Tabs activeKey={activeTab} onChange={(key: string) => setActiveTab(key as TabKeyType)}>
            {Object.values(TabKeyType).map((key) => (
              <Tabs.TabPane
                tab={tabTitle[key]}
                key={key}
              />
            ))}
          </Tabs>
        </>}
      />
      {tabMapping[activeTab]}
    </Loader>
  )
}
