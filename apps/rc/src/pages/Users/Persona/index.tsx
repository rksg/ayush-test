import { createContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                                          from '@acx-ui/components'
import { useSearchPersonaGroupListQuery, useSearchPersonaListQuery } from '@acx-ui/rc/services'
import { useTableQuery }                                             from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                     from '@acx-ui/react-router-dom'

import { PersonaGroupTable } from './PersonaGroupTable'
import { PersonaTable }      from './PersonaTable'

export const PersonaGroupContext = createContext({} as {
  setPersonaGroupCount: (data: number) => void
})
export const PersonasContext = createContext({} as {
  setPersonasCount: (data: number) => void
})
enum PersonaTabKey {
  PERSONA = 'persona',
  PERSONA_GROUP = 'persona-group'
}

function PersonaPageHeader () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/users/persona-management/')
  const navigate = useNavigate()
  const [ personaGroupCount, setPersonaGroupCount ] = useState(0)
  const [ personasCount, setPersonasCount ] = useState(0)

  const personaGroupTableQuery = useTableQuery( {
    useQuery: useSearchPersonaGroupListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { keyword: '' }
  })

  const personaTableQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: ''
    }
  })

  useEffect(() => {
    setPersonaGroupCount(personaGroupTableQuery.data?.totalCount || 0)
  }, [personaGroupTableQuery.data])

  useEffect(() => {
    setPersonasCount(personaTableQuery.data?.totalCount || 0)
  }, [personaTableQuery.data])

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const getTabComp = (activeTab?: PersonaTabKey) => {
    if (activeTab === PersonaTabKey.PERSONA) {
      return <PersonasContext.Provider value={{ setPersonasCount }}>
        <PersonaTable />
      </PersonasContext.Provider>
    }

    return <PersonaGroupContext.Provider value={{ setPersonaGroupCount }}>
      <PersonaGroupTable />
    </PersonaGroupContext.Provider>
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Persona Management' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
        footer={
          <Tabs type='first' onChange={onTabChange} activeKey={params.activeTab}>
            <Tabs.TabPane
              key={PersonaTabKey.PERSONA_GROUP}
              tab={$t(
                { defaultMessage: 'Persona Groups ({personaGroupCount})' },
                { personaGroupCount }
              )}
            />
            <Tabs.TabPane
              key={PersonaTabKey.PERSONA}
              tab={$t({ defaultMessage: 'Personas ({personasCount})' }, { personasCount })}
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
