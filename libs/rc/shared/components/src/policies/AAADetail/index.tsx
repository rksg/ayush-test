import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { useGetAAAPolicyTemplateQuery }                 from '@acx-ui/msp/services'
import { useGetAAAProfileDetailQuery }                  from '@acx-ui/rc/services'
import {
  AAAPolicyType, CONFIG_TEMPLATE_LIST_PATH,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  policyTypeLabelMapping, useConfigTemplate
} from '@acx-ui/rc/utils'
import { TenantLink, TenantType } from '@acx-ui/react-router-dom'
import { filterByAccess }         from '@acx-ui/user'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'

export function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetAAAPolicyInstance()
  const tablePath = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })
  const GenBreadcrumb = () => {
    const { isTemplate } = useConfigTemplate()
    if (isTemplate) {
      return [
        { text: $t({ defaultMessage: 'Config Templates' }), link: '', tenantType: 'v' },
        // eslint-disable-next-line max-len
        { text: $t({ defaultMessage: 'Template List' }), link: CONFIG_TEMPLATE_LIST_PATH, tenantType: 'v' }
      ] as { text: string, link?: string, tenantType?: TenantType }[]
    }

    return [
      { text: $t({ defaultMessage: 'Network Control' }) },
      {
        text: $t({ defaultMessage: 'Policies & Profiles' }),
        link: getPolicyListRoutePath(true)
      },
      { text: $t(policyTypeLabelMapping[PolicyType.AAA]), link: tablePath }
    ] as { text: string, link?: string, tenantType?: TenantType }[]
  }
  const breadcrumb = GenBreadcrumb()

  return (
    <>
      <PageHeader
        title={queryResults.data?.name||''}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.AAA,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <AAAOverview aaaProfile={queryResults.data as AAAPolicyType} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AAAInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}

export function useGetAAAPolicyInstance () {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const requestPayload = { params }
  const aaaPolicyResult = useGetAAAProfileDetailQuery(requestPayload, {
    skip: isTemplate
  })
  const aaaPolicyTemplateResult = useGetAAAPolicyTemplateQuery(requestPayload, {
    skip: !isTemplate
  })

  return isTemplate ? aaaPolicyTemplateResult : aaaPolicyResult
}
