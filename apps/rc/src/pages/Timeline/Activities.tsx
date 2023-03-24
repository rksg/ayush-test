import {
  ActivityTable,
  useActivityTableQuery
}   from '@acx-ui/rc/components'

const Activities = () => {
  const tableQuery = useActivityTableQuery()

  return <ActivityTable
    columnState={{ hidden: true }}
    tableQuery={tableQuery}
  />
}

export { Activities }
