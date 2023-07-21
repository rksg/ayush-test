

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Card, Loader, PageHeader,  GridRow, GridCol, SummaryCard } from '@acx-ui/components'
import { useGetConnectionMeteringByIdQuery }                                from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation, getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { DataConsumptionLabel }  from '../DataConsumptionHelper'
import { RateLimitingTableCell } from '../RateLimitingHelper'

import { ConnectionMeteringInstanceTable } from './ConnectionMeteringInstanceTable'


export default function ConnectionMeteringDetail () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const profileQuery = useGetConnectionMeteringByIdQuery({ params: { id: policyId } })

  const basicInfo = [
    {
      title: $t({ defaultMessage: 'Rate Limiting' }),
      content: profileQuery.data && <RateLimitingTableCell
        uploadRate={profileQuery.data.uploadRate}
        downloadRate={profileQuery.data.downloadRate}
      />,
      colSpan: 5
    },
    {
      title: $t({ defaultMessage: 'Data Consumption' }),
      content: profileQuery.data && <DataConsumptionLabel
        {...profileQuery.data}
      />,
      colSpan: 5
    }
  ]

  return (
    <Loader states={[profileQuery]}>
      <PageHeader
        title={profileQuery.data?.name}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Data Usage Metering' }),
            link: getPolicyRoutePath({
              type: PolicyType.CONNECTION_METERING,
              oper: PolicyOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            policyId: policyId!,
            type: PolicyType.CONNECTION_METERING,
            oper: PolicyOperation.EDIT
          })}>
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SummaryCard
            isLoading={profileQuery.isLoading}
            isFetching={profileQuery.isFetching}
            data={basicInfo}
          />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <Card>
            <ConnectionMeteringInstanceTable data={profileQuery.data?.personas ?? []} />
          </Card>
        </GridCol>
      </GridRow>
    </Loader>
  )
}
