import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader }                                                          from '@acx-ui/components'
import { SwitchClientsTable, SwitchClientContext, defaultSwitchClientPayload } from '@acx-ui/rc/components'
import { useGetSwitchClientListQuery }                                         from '@acx-ui/rc/services'
import { usePollingTableQuery }                                                from '@acx-ui/rc/utils'

export default function ClientList () {
  const { $t } = useIntl()
  const [ switchCount, setSwitchCount ] = useState(0)
  const [ tableQueryFilters, setTableQueryFilters ] = useState({})

  const tableQuery = usePollingTableQuery({
    useQuery: useGetSwitchClientListQuery,
    defaultPayload: {
      ...defaultSwitchClientPayload
    },
    search: {
      searchTargetFields: defaultSwitchClientPayload.searchTargetFields
    }
  })

  useEffect(() => {
    setSwitchCount(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  return <SwitchClientContext.Provider value={{
    setSwitchCount, tableQueryFilters, setTableQueryFilters
  }}>
    <PageHeader
      title={$t({ defaultMessage: 'Wired ({switchCount})' }, { switchCount })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
    />
    <SwitchClientsTable filterByVenue={true} filterBySwitch={true} />
  </SwitchClientContext.Provider>
}
