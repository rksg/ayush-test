import { ApTable } from '../../ApTable'

export default function ApGroupMembersTab () {

  return (
    <ApTable searchable={true}
      enableGroups={false}
      filterables={{ deviceStatus: [] }}/>
  )
}
