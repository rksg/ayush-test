// import { useContext } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

// import { VenueEditContext } from './index'

function VenueEditTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/edit/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  // const { isDirty, setIsDirty } = useContext(VenueEditContext)

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Venue Details' })} key='details' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi Configuration' })} key='wifi' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch Configuration' })} key='switch' />
    </Tabs>
  )
}

export default VenueEditTabs