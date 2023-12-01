
import { ApTable } from '@acx-ui/rc/components'

export default function ApGroupMembersTab () {

  return (
    <ApTable searchable={true}
      enableGroups={false}
      filterables={{ deviceStatus: [] }}/>
  )
}