import { MacRegistrationsTable }                                                    from '@acx-ui/rc/components'
import { useSearchMacRegistrationsQuery }                                           from '@acx-ui/rc/services'
import { MacRegistration, MacRegistrationDetailsTabKey, TableQuery, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                                                                from '@acx-ui/react-router-dom'
import { RequestPayload }                                                           from '@acx-ui/types'
import { goToNotFound }                                                             from '@acx-ui/user'


import { MacRegistrationListOverviewTab } from './MacRegistrationListOverviewTab'
import MacRegistrationListPageHeader      from './MacRegistrationListPageHeader'

const sorter = {
  sortField: 'macAddress',
  sortOrder: 'ASC'
}
const filter = {
  filterKey: 'macAddress',
  operation: 'cn',
  value: ''
}

export default function MacRegistrationListDetails () {
  const { activeTab, policyId } = useParams()
  const settingsId = 'mac-regs-table'
  const tableQuery = useTableQuery({
    useQuery: useSearchMacRegistrationsQuery,
    sorter,
    defaultPayload: {
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter }
      ]
    }
  })

  const getTabComp = (activeTab?: string) => {
    if (activeTab === MacRegistrationDetailsTabKey.OVERVIEW) {
      return <MacRegistrationListOverviewTab />
    } else if (activeTab === MacRegistrationDetailsTabKey.MAC_REGISTRATIONS) {
      return <MacRegistrationsTable
        policyId={policyId!}
        tableQuery={tableQuery as unknown as TableQuery<MacRegistration, RequestPayload, unknown>}
        settingsId={settingsId}
      />
    } else {
      return goToNotFound()
    }
  }

  return <>
    <MacRegistrationListPageHeader />
    { getTabComp(activeTab) }
  </>
}
