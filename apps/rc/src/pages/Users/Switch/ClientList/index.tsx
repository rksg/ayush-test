import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader }                                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { SwitchClientsTable, SwitchClientContext, defaultSwitchClientPayload } from '@acx-ui/rc/components'
import { useGetSwitchClientListQuery }                                         from '@acx-ui/rc/services'
import { usePollingTableQuery }                                                from '@acx-ui/rc/utils'
import { LoadTimeProvider, TrackingPages }                                     from '@acx-ui/utils'

export default function ClientList () {
  const { $t } = useIntl()
  const [ switchCount, setSwitchCount ] = useState(0)
  const [ tableQueryFilters, setTableQueryFilters ] = useState({})
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const tableQuery = usePollingTableQuery({
    useQuery: useGetSwitchClientListQuery,
    defaultPayload: {
      ...defaultSwitchClientPayload
    },
    search: {
      searchTargetFields: defaultSwitchClientPayload.searchTargetFields
    },
    enableRbac: isSwitchRbacEnabled
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
    <LoadTimeProvider page={TrackingPages.WIRED_CLIENTS}>
      <SwitchClientsTable filterByVenue={true} filterBySwitch={true} />
    </LoadTimeProvider>
  </SwitchClientContext.Provider>
}
