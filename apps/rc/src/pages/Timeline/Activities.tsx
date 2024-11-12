import {
  ActivityTable,
  useActivityTableQuery
}   from '@acx-ui/rc/components'

const Activities = () => {
  const settingsId = 'timeline-activity-table'
  const tableQuery = useActivityTableQuery(
    undefined,
    { settingsId }
  )

  return <ActivityTable settingsId={settingsId} tableQuery={tableQuery} />
}

export { Activities }
