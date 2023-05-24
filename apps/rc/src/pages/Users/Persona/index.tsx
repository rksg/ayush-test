
import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { PersonaGroupTable } from './PersonaGroupTable'
import { PersonaTable }      from './PersonaTable'

function PersonaPageHeader () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/users/persona-management/')
  const navigate = useNavigate()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
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
            key={'persona-group'}
            tab={$t({ defaultMessage: 'Persona Group' })}
            children={<PersonaGroupTable />}
          />
          <Tabs.TabPane
            key={'persona'}
            tab={isNavbarEnhanced
              ? $t({ defaultMessage: 'Personas' })
              : $t({ defaultMessage: 'Persona' })
            }
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
