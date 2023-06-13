
import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { PersonaGroupTable } from './PersonaGroupTable'
import { PersonaTable }      from './PersonaTable'

enum PersonaTabKey {
  PERSONA = 'persona',
  PERSONA_GROUP = 'persona-group'
}

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

  const getTabComp = (activeTab?: PersonaTabKey) => {
    if (activeTab === PersonaTabKey.PERSONA) {
      return <PersonaTable />
    }

    return <PersonaGroupTable />
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Persona Management' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Users' }), link: '/users' }
        ]}
        footer={
          <Tabs onChange={onTabChange} activeKey={params.activeTab}>
            <Tabs.TabPane
              key={PersonaTabKey.PERSONA_GROUP}
              tab={$t({ defaultMessage: 'Persona Group' })}
            />
            <Tabs.TabPane
              key={PersonaTabKey.PERSONA}
              tab={$t({ defaultMessage: 'Persona' })}
            />
          </Tabs>
        }
      />
      { getTabComp(params.activeTab as PersonaTabKey) }
    </>
  )
}

function PersonaPortal () {

  return (
    <PersonaPageHeader/>
  )
}

export default PersonaPortal
