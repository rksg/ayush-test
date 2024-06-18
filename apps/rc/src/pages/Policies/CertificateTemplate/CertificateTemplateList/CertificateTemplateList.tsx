import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }                                                                         from '@acx-ui/components'
import { useGetCertificateAuthoritiesQuery, useGetCertificateTemplatesQuery, useGetCertificatesQuery }      from '@acx-ui/rc/services'
import { CertificateCategoryType, PolicyOperation, PolicyType, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink }                                                     from '@acx-ui/react-router-dom'
import { WifiScopes }                                                                                       from '@acx-ui/types'
import { filterByAccess }                                                                                   from '@acx-ui/user'

import CertificateAuthorityTable from '../CertificateTemplateTable/CertificateAuthorityTable'
import CertificateTable          from '../CertificateTemplateTable/CertificateTable'
import CertificateTemplateTable  from '../CertificateTemplateTable/CertificateTemplateTable'


export default function CertificateTemplateList (props: { tabKey: CertificateCategoryType }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const getCertificateTemplates =
    useGetCertificateTemplatesQuery({ payload: { pageSize: 1, page: 1 } })
  const getCertificateAuthorities =
    useGetCertificateAuthoritiesQuery({ payload: { pageSize: 1, page: 1 } })
  const getCertificates = useGetCertificatesQuery({ payload: { pageSize: 1, page: 1 } })

  const tabs: Record<CertificateCategoryType, JSX.Element> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]: <CertificateTemplateTable/>,
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]: <CertificateAuthorityTable/>,
    [CertificateCategoryType.CERTIFICATE]: <CertificateTable />
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
    }))
  }

  const buttonTextMapping: Record<CertificateCategoryType, string> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]:
      $t({ defaultMessage: 'Add Certificate Template' }),
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]:
      $t({ defaultMessage: 'Add Certificate Authority' }),
    [CertificateCategoryType.CERTIFICATE]: $t({ defaultMessage: 'Generate Certificate' })
  }

  const buttonLinkMapping: Record<CertificateCategoryType, string> = {
    [CertificateCategoryType.CERTIFICATE_TEMPLATE]:
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE }),
    [CertificateCategoryType.CERTIFICATE_AUTHORITY]:
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE }),
    [CertificateCategoryType.CERTIFICATE]:
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE })
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as CertificateCategoryType])
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Certificate Template' })}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Network Control' })
        }, {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }]}
        extra={filterByAccess([
          <TenantLink
            to={buttonLinkMapping[props.tabKey]}
            scopeKey={[WifiScopes.CREATE]}
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
          </Tabs>
        }
      />
      {tabs[props.tabKey]}
    </>
  )
}

