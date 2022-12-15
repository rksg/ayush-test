
import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { PersonaGroupTable } from './PersonaGroupTable'
import { PersonaTable }      from './PersonaTable'

function PersonaPageHeader () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/users/persona-management/')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <PageHeader
      title={$t({ defaultMessage: 'Persona Management' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Users' }), link: '/users' }
      ]}
      footer={
        <Tabs onChange={onTabChange} activeKey={params.activeTab}>
          <Tabs.TabPane
            key={'persona-group'}
            tab={$t({ defaultMessage: 'Persona Group' })}
            children={<PersonaGroupTable />}
          />
          <Tabs.TabPane
            key={'persona'}
            tab={$t({ defaultMessage: 'Persona' })}
            children={<PersonaTable />}
          />
        </Tabs>
      }
    />
  )
}

function PersonaPortal () {

  return (
    <PersonaPageHeader/>
  )
}

export default PersonaPortal
