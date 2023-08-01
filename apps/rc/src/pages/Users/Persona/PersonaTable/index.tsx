
import { BasePersonaTable } from './BasePersonaTable'


export function PersonaTable () {
  return (
    <BasePersonaTable
      colProps={{
        name: { searchable: true },
        email: { searchable: true },
        description: { searchable: true },
        vni: { show: false },
        identityId: { disable: true, show: false },
        deviceCount: { disable: true, show: false }
      }}
    />
  )
}
