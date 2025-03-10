import { useContext, useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { MacRegistrationsTable, ResourceBanner }                 from '@acx-ui/rc/components'
import { useGetMacRegListQuery, useSearchMacRegistrationsQuery } from '@acx-ui/rc/services'
import {
  MacRegistration,
  MacRegistrationPoolLink,
  PersonaGroup,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'

import { IdentityDetailsContext } from './index'


const macRegDefaultSorter = {
  sortField: 'macAddress',
  sortOrder: 'ASC'
}

function MacAddressTab (props: { personaGroupData?: PersonaGroup }) {
  const { $t } = useIntl()
  const { personaId } = useParams()
  const { personaGroupData } = props

  const { setMacAddressCount } = useContext(IdentityDetailsContext)

  const { data: macRegData } = useGetMacRegListQuery(
    { params: { policyId: personaGroupData?.macRegistrationPoolId } },
    { skip: !personaGroupData?.macRegistrationPoolId }
  )
  const macRegistrationTableQuery = useTableQuery({
    useQuery: useSearchMacRegistrationsQuery,
    sorter: macRegDefaultSorter,
    defaultPayload: {
      dataOption: 'all',
      searchCriteriaList: [
        {
          filterKey: 'identityId',
          operation: 'eq',
          value: personaId ?? '--'
        }
      ]
    },
    pagination: { settingsId: 'identity-macregistration-table' },
    apiParams: { policyId: personaGroupData?.macRegistrationPoolId ?? '' },
    option: {
      skip: !personaGroupData?.macRegistrationPoolId || !personaId
    }
  }) as unknown as TableQuery<MacRegistration, RequestPayload, unknown>

  useEffect(() => {
    if (!macRegistrationTableQuery.isLoading && macRegistrationTableQuery.data) {
      setMacAddressCount(macRegistrationTableQuery.data?.totalCount ?? 0)
    }
  }, [macRegistrationTableQuery.isLoading])

  return (personaGroupData?.macRegistrationPoolId
    ? <>
      <ResourceBanner context={
        $t({ defaultMessage: 'MAC Addresses have been maintained in template: {source}' },
          {
            source: <MacRegistrationPoolLink
              macRegistrationPoolId={personaGroupData.macRegistrationPoolId}
              name={macRegData?.name}
              showNoData
            />
          })}
      />

      <MacRegistrationsTable
        policyId={personaGroupData?.macRegistrationPoolId}
        tableQuery={macRegistrationTableQuery}
      />
    </> : <></>)
}

export default MacAddressTab
