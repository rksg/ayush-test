
import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, PageHeader } from '@acx-ui/components'

import { PersonaGroupTable } from './PersonaGroupTable'
import { PersonaTable }      from './PersonaTable'

function PersonaPageHeader () {
  const { $t } = useIntl()

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Persona Group' }),
      value: 'persona-group',
      children: <PersonaGroupTable />
    },
    {
      label: $t({ defaultMessage: 'Persona' }),
      value: 'persona',
      children: <PersonaTable />
    }
  ]

  return (
    <PageHeader
      title={$t({ defaultMessage: 'Persona Management' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Users' }), link: '/users' }
      ]}
      footer={<ContentSwitcher tabDetails={tabDetails} align={'left'} />}
    />
  )
}

function PersonaPortal () {

  return (
    <PersonaPageHeader/>
  )
}

export default PersonaPortal
