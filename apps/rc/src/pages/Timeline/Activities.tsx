import {
  ActivityTable,
  useActivityTableQuery
}   from '@acx-ui/rc/components'

const Activities = () => {
  const tableQuery = useActivityTableQuery()

  return <ActivityTable tableQuery={tableQuery} />
}

export { Activities }
