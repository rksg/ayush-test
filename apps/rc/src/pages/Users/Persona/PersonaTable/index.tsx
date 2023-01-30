
import { BasePersonaTable } from './BasePersonaTable'


export function PersonaTable () {
  return (
    <BasePersonaTable
      colProps={{
        name: { searchable: true },
        groupId: { filterable: true },
        vni: { show: false }
      }}
    />
  )
}
