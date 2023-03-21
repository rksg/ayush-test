import { AdminLogTable, useAdminLogsTableQuery } from '@acx-ui/rc/components'

const AdminLogs = () => {
  const tableQuery = useAdminLogsTableQuery()
  return <AdminLogTable tableQuery={tableQuery}/>
}

export { AdminLogs }
