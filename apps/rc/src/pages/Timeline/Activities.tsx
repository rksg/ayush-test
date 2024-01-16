import {
  ActivityTable,
  useActivityTableQuery
}   from '@acx-ui/rc/components'

const Activities = () => {
  const tableQuery = useActivityTableQuery(
    undefined,
    { settingsId: 'timeline-activity-table' }
  )

  return <ActivityTable settingsId='timeline-activity-table' tableQuery={tableQuery} />
}

export { Activities }
