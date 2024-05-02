import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, PageHeader, SummaryCard, Tabs }                                                                                          from '@acx-ui/components'
import { caTypeShortLabel }                                                                                                                       from '@acx-ui/rc/components'
import { useGetAdaptivePolicySetQuery, useGetCertificateAuthorityQuery, useGetCertificateTemplateQuery, useGetSpecificTemplateCertificatesQuery } from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath }                                          from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                             from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                                                         from '@acx-ui/user'
import { noDataDisplay }                                                                                                                          from '@acx-ui/utils'

import CertificateTable from '../CertificateTemplateTable/CertificateTable'
import { Section }      from '../styledComponents'

import ChromebookTab from './ChromebookTab'

enum TabKeyType {
  CERTIFICATE = 'certificate',
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
  const { data: certificateTemplateData, isLoading } = useGetCertificateTemplateQuery({ params })
  const { policySetName } = useGetAdaptivePolicySetQuery(
    { params: { policySetId: certificateTemplateData?.policySetId } },
    {
      skip: !certificateTemplateData?.policySetId,
      selectFromResult: ({ data }) => ({
        policySetName: data?.name || certificateTemplateData?.policySetId
      })
    })
  const { privateKeyBase64 } = useGetCertificateAuthorityQuery(
    { params: { caId: certificateTemplateData?.onboard?.certificateAuthorityId } },
    {
      skip: !certificateTemplateData?.onboard?.certificateAuthorityId,
      selectFromResult: ({ data }) => ({
        privateKeyBase64: data?.privateKeyBase64
      })
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
      title: $t({ defaultMessage: 'Adaptive Policy Set' }),
      content: policySetName || certificateTemplateData?.policySetId || noDataDisplay,
      colSpan: 4
    }
  ]

  const tabMapping = {
    [TabKeyType.CERTIFICATE]: <CertificateTable
      templateData={certificateTemplateData}
      showGenerateCert={!!privateKeyBase64} />,
    [TabKeyType.CHROMEBOOK]: <ChromebookTab data={certificateTemplateData} />
  }

  const tabTitle = {
    [TabKeyType.CERTIFICATE]: $t({ defaultMessage: 'Certificate ({count})' },
      { count: certificate.data?.totalCount || 0 }),
    [TabKeyType.CHROMEBOOK]: $t({ defaultMessage: 'Chromebook Enrollment' })
  }

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={certificateTemplateData?.name}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Network Control' })
        },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        },
        {
          text: $t({ defaultMessage: 'Certificate Template' }),
          link: getPolicyRoutePath({
            type: PolicyType.CERTIFICATE_TEMPLATE,
            oper: PolicyOperation.LIST
          })
        }]}
        extra={filterByAccess([
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.CERTIFICATE_TEMPLATE,
              oper: PolicyOperation.EDIT,
              policyId: params.policyId!
            })}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Section>
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
      {tabMapping[activeTab]}
    </Loader>
  )
}
