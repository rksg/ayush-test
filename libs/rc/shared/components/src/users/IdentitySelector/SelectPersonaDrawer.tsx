import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer }  from '@acx-ui/components'
import { Persona } from '@acx-ui/rc/utils'

import { BasePersonaTable } from '../PersonaTable/BasePersonaTable'


interface SelectPersonaDrawerProps {
  identityGroupId?: string,
  identityId?: string,
  onSubmit?: (persona?: Persona) => void,
  onCancel?: () => void,
  disableAddDevices?: boolean,
  useByIdentityGroup?: boolean
}

export function SelectPersonaDrawer (props: SelectPersonaDrawerProps) {
  const { $t } = useIntl()
  const { identityGroupId: personaGroupId, identityId, onSubmit, onCancel,
    disableAddDevices, useByIdentityGroup = false } = props
  const [ selectedPersona, setSelectedPersona ] = useState<Persona>()

  return <Drawer
    visible
    destroyOnClose
    width={700}
    title={
      useByIdentityGroup ?
        $t({ defaultMessage: 'Associate Identity' }) :
        $t({ defaultMessage: 'Select Identity' })
    }
    push={false}
    onClose={onCancel}
    footer={
      <Drawer.FormFooter
        buttonLabel={{
          save: identityId
            ? $t({ defaultMessage: 'Change' })
            : $t({ defaultMessage: 'Add' })
        }}
        onSave={async () => onSubmit?.(selectedPersona)}
        onCancel={() => onCancel?.()}
      />
    }
    children={<BasePersonaTable
      mode={'selectable'}
      defaultSelectedPersonaId={identityId}
      personaGroupId={personaGroupId}
      settingsId={'select-persona-drawer'}
      onChange={(p) => setSelectedPersona(p)}
      disableAddDevices={disableAddDevices}
      useByIdentityGroup={useByIdentityGroup}
      colProps={{
        name: { searchable: true },
        email: { searchable: true },
        description: { searchable: true },
        vlan: { disable: true, show: false },
        certificateCount: { disable: true, show: false },
        ethernetPorts: { disable: true, show: false },
        switches: { disable: true, show: false },
        vni: { disable: true, show: false },
        groupId: { disable: true, show: false, filterable: false }
      }}

    />}
  />
}
