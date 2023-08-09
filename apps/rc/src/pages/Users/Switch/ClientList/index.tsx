import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader }                                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { SwitchClientsTable, SwitchClientContext, defaultSwitchClientPayload } from '@acx-ui/rc/components'
import { useGetSwitchClientListQuery }                                         from '@acx-ui/rc/services'
import { usePollingTableQuery }                                                from '@acx-ui/rc/utils'

export default function ClientList () {
  const { $t } = useIntl()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const [ switchCount, setSwitchCount ] = useState(0)

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

  return <SwitchClientContext.Provider value={{ setSwitchCount }}>
    <PageHeader
      title={isNavbarEnhanced
        ? $t({ defaultMessage: 'Wired ({switchCount})' }, { switchCount })
        : $t({ defaultMessage: 'Switch' })
      }
      breadcrumb={isNavbarEnhanced ?[
        { text: $t({ defaultMessage: 'Clients' }) }
      ] : undefined}
    />
    <SwitchClientsTable filterByVenue={true} filterBySwitch={true} />
  </SwitchClientContext.Provider>
}
