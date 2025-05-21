import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }                                                                                                                                                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                                                                       from '@acx-ui/feature-toggle'
import { CertificateTable }                                                                                                                                                                             from '@acx-ui/rc/components'
import { useGetCertificateAuthoritiesQuery, useGetCertificateTemplatesQuery, useGetCertificatesQuery, useGetServerCertificatesQuery }                                                                   from '@acx-ui/rc/services'
import { CertificateCategoryType, CertificateUrls, PolicyOperation, PolicyType, filterByAccessForServicePolicyMutation, usePoliciesBreadcrumb, getPolicyRoutePath, getScopeKeyByPolicy, useTableQuery } from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink }                                                                                                                                                 from '@acx-ui/react-router-dom'
import { getOpsApi }                                                                                                                                                                                    from '@acx-ui/utils'

import CertificateAuthorityTable from '../CertificateTemplateTable/CertificateAuthorityTable'
import CertificateTemplateTable  from '../CertificateTemplateTable/CertificateTemplateTable'
import ServerCertificatesTable   from '../ServerCertificates'


export default function CertificateTemplateList (props: { tabKey: CertificateCategoryType }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const getCertificateTemplates =
    useGetCertificateTemplatesQuery({ payload: { pageSize: 1, page: 1 } })
  const getCertificateAuthorities =
    useGetCertificateAuthoritiesQuery({ payload: { pageSize: 1, page: 1 } })
  const getCertificates = useGetCertificatesQuery({ payload: { pageSize: 1, page: 1 } })
  const certificateTableQuery = useTableQuery({
    useQuery: useGetCertificatesQuery,
    defaultPayload: {}
  })

  const getServerCertificates = useGetServerCertificatesQuery({ payload: { pageSize: 1, page: 1 } })

  const isServerCertificateFFToggle = useIsSplitOn(Features.SERVER_CERTIFICATE_MANAGEMENT_UI_TOGGLE)

  const tabs: Record<CertificateCategoryType, JSX.Element> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]: <CertificateTemplateTable/>,
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]: <CertificateAuthorityTable/>,
    [CertificateCategoryType.CERTIFICATE]: <CertificateTable tableQuery={certificateTableQuery}/>,
    [CertificateCategoryType.SERVER_CERTIFICATES]: <ServerCertificatesTable/>
  }

  const tabsPathMapping: Record<CertificateCategoryType, Path> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.CERTIFICATE_TEMPLATE,
      oper: PolicyOperation.LIST
    })),
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.CERTIFICATE_AUTHORITY,
      oper: PolicyOperation.LIST
    })),
    [CertificateCategoryType.CERTIFICATE]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.CERTIFICATE,
      oper: PolicyOperation.LIST
    })),
    [CertificateCategoryType.SERVER_CERTIFICATES]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.SERVER_CERTIFICATES,
      oper: PolicyOperation.LIST
    }))
  }

  const buttonTextMapping: Record<CertificateCategoryType, string> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]:
      $t({ defaultMessage: 'Add Certificate Template' }),
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]:
      $t({ defaultMessage: 'Add Certificate Authority' }),
    [CertificateCategoryType.CERTIFICATE]: $t({ defaultMessage: 'Generate Certificate' }),
    [CertificateCategoryType.SERVER_CERTIFICATES]:
      $t({ defaultMessage: 'Generate Certificate' })
  }

  const buttonLinkMapping: Record<CertificateCategoryType, string> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]:
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE }),
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]:
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE }),
    [CertificateCategoryType.CERTIFICATE]:
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE }),
    [CertificateCategoryType.SERVER_CERTIFICATES]:
      getPolicyRoutePath({ type: PolicyType.SERVER_CERTIFICATES, oper: PolicyOperation.CREATE })
  }

  const rbacOpsMapping: Record<CertificateCategoryType, string[]> = {
    /* eslint-disable max-len */
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]: [getOpsApi(CertificateUrls.addCertificateTemplate)],
    /* eslint-disable max-len */
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]: [getOpsApi(CertificateUrls.addCA), getOpsApi(CertificateUrls.addSubCA)],
    /* eslint-disable max-len */
    [CertificateCategoryType.CERTIFICATE]: [getOpsApi(CertificateUrls.generateCertificatesToIdentity)],
    /* eslint-disable max-len */
    [CertificateCategoryType.SERVER_CERTIFICATES]: [getOpsApi(CertificateUrls.generateClientServerCertificate), getOpsApi(CertificateUrls.uploadCertificate)]
  }


  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as CertificateCategoryType])
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Certificate Template' })}
        breadcrumb={usePoliciesBreadcrumb()}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={buttonLinkMapping[props.tabKey]}
            scopeKey={getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.CREATE)}
            rbacOpsIds={rbacOpsMapping[props.tabKey]}
          >
            <Button key='configure' type='primary'>{buttonTextMapping[props.tabKey]}</Button>
          </TenantLink>
        ])}
        footer={
          <Tabs activeKey={props.tabKey} onChange={onTabChange}>
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Certificate ({count})' },
                { count: getCertificates.data?.totalCount || 0 })}
              key={CertificateCategoryType.CERTIFICATE}
            />
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Certificate Template ({count})' },
                { count: getCertificateTemplates.data?.totalCount || 0 })}
              key={CertificateCategoryType.CERTIFICATE_TEMPLATE}
            />
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Certificate Authority ({count})' },
                { count: getCertificateAuthorities.data?.totalCount || 0 })}
              key={CertificateCategoryType.CERTIFICATE_AUTHORITY}
            />
            { isServerCertificateFFToggle &&
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Server & Client Certificates ({count})' },
                { count: getServerCertificates.data?.totalCount || 0 })}
              key={CertificateCategoryType.SERVER_CERTIFICATES}
            />
            }
          </Tabs>
        }
      />
      {tabs[props.tabKey]}
    </>
  )
}

