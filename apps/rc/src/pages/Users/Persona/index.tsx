import { createContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
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
        breadcrumb={[{
          text: isNavbarEnhanced
            ? $t({ defaultMessage: 'Clients' })
            : $t({ defaultMessage: 'Users' }),
          link: isNavbarEnhanced ? '' : '/users'
        }]}
        footer={
          <Tabs onChange={onTabChange} activeKey={params.activeTab}>
            <Tabs.TabPane
              key={PersonaTabKey.PERSONA_GROUP}
              tab={isNavbarEnhanced
                ? $t({ defaultMessage: 'Persona Groups ({personaGroupCount})' },
                  { personaGroupCount })
                : $t({ defaultMessage: 'Persona Group' })
              }
            />
            <Tabs.TabPane
              key={PersonaTabKey.PERSONA}
              tab={isNavbarEnhanced
                ? $t({ defaultMessage: 'Personas ({personasCount})' }, { personasCount })
                : $t({ defaultMessage: 'Persona' })
              }
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
