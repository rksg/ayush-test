import { UserProfile } from '@acx-ui/user'

import { AdministrationDelegationsTable } from './AdministrationDelegationsTable'
import { MSPAdministratorsTable }         from './MSPAdministratorsTable'

interface AdminDelegationsTableProps {
  isMspEc: boolean;
  userProfileData: UserProfile | undefined;
}
const AdminDelegationsTable = (props: AdminDelegationsTableProps) => {
  const { isMspEc, userProfileData } = props
  const isSupport = userProfileData?.support ?? false

  return (
    isMspEc ?
      <MSPAdministratorsTable />
      : <AdministrationDelegationsTable isSupport={isSupport} />

  )
}

export default AdminDelegationsTable
