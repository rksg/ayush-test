import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol }              from '@acx-ui/components'
import { useGetAAAProfileDetailQuery, useGetAAAPolicyTemplateQuery } from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  PolicyOperation,
  PolicyType,
  useConfigTemplateQueryFnSwitcher,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { PolicyConfigTemplateLinkSwitcher } from '../../configTemplates'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'

export function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetAAAPolicyInstance()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.AAA)

  return (
    <>
      <PageHeader
        title={queryResults.data?.name||''}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <PolicyConfigTemplateLinkSwitcher
            type={PolicyType.AAA}
            oper={PolicyOperation.EDIT}
            policyId={params.policyId!}
            children={
              <Button key={'configure'} type={'primary'}>
                {$t({ defaultMessage: 'Configure' })}
              </Button>
            }
          />
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
  return useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetAAAProfileDetailQuery,
    useTemplateQueryFn: useGetAAAPolicyTemplateQuery
  })
}
