import { createContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                                          from '@acx-ui/components'
import { useSearchPersonaGroupListQuery, useSearchPersonaListQuery } from '@acx-ui/rc/services'
import { useTableQuery }                                             from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                     from '@acx-ui/react-router-dom'

import { PersonaGroupTable } from './PersonaGroupTable'
import { PersonaTable }      from './PersonaTable'

export const IdentityGroupContext = createContext({} as {
  setIdentityGroupCount: (data: number) => void
})
export const IdentitiesContext = createContext({} as {
  setIdentitiesCount: (data: number) => void
})
enum IdentityTabKey {
  IDENTITY = 'identity',
  IDENTITY_GROUP = 'identity-group'
}

function PersonaPageHeader () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/users/identity-management/')
  const navigate = useNavigate()
  const [ identityGroupCount, setIdentityGroupCount ] = useState(0)
  const [ identitiesCount, setIdentitiesCount ] = useState(0)

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
    setIdentityGroupCount(personaGroupTableQuery.data?.totalCount || 0)
  }, [personaGroupTableQuery.data])

  useEffect(() => {
    setIdentitiesCount(personaTableQuery.data?.totalCount || 0)
  }, [personaTableQuery.data])

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const getTabComp = (activeTab?: IdentityTabKey) => {
    if (activeTab === IdentityTabKey.IDENTITY) {
      return <IdentitiesContext.Provider value={{ setIdentitiesCount: setIdentitiesCount }}>
        <PersonaTable />
      </IdentitiesContext.Provider>
    }

    return <IdentityGroupContext.Provider value={{ setIdentityGroupCount: setIdentityGroupCount }}>
      <PersonaGroupTable />
    </IdentityGroupContext.Provider>
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Identity Management' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
        footer={
          <Tabs onChange={onTabChange} activeKey={params.activeTab}>
            <Tabs.TabPane
              key={IdentityTabKey.IDENTITY_GROUP}
              tab={$t(
                { defaultMessage: 'Identity Groups ({identityGroupCount})' },
                { identityGroupCount }
              )}
            />
            <Tabs.TabPane
              key={IdentityTabKey.IDENTITY}
              tab={$t({ defaultMessage: 'Identities ({identitiesCount})' }, { identitiesCount })}
            />
          </Tabs>
        }
      />
      { getTabComp(params.activeTab as IdentityTabKey) }
    </>
  )
}

function PersonaPortal () {

  return (
    <PersonaPageHeader/>
  )
}

export default PersonaPortal
