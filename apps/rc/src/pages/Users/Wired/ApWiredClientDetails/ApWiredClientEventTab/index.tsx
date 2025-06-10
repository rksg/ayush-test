import { useParams } from 'react-router-dom'

import { EventTable, useEventsTableQuery } from '@acx-ui/rc/components'

const ApWiredClientEventTab = () => {
  const { clientId } = useParams()
  const tableQuery = useEventsTableQuery(
    { entity_type: ['CLIENT'], clientMac: [clientId] }
  )
  return <EventTable
    tableQuery={tableQuery}
    searchables={false}
    filterables={['severity']}
    omitColumns={['entity_type', 'product', 'source', 'macAddress']}
  />
}

export default ApWiredClientEventTab