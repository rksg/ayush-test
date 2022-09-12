import React from 'react'

import { useIntl } from 'react-intl'

import { Layout as LayoutComponent } from '@acx-ui/components'
import { Outlet }                    from '@acx-ui/react-router-dom'

import HeaderButtons     from './HeaderButtons'
import HeaderDropDown    from './HeaderDropDown'
import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const headerDropdownList = [
    $t({ defaultMessage: 'US' })
  ]
  return (
    <UI.Wrapper>
      <LayoutComponent
        menuConfig={useMenuConfig()}
        content={<Outlet />}
        leftHeaderContent={
          <HeaderDropDown
            list={headerDropdownList}
            selected={headerDropdownList[0]}
          />
        }
        rightHeaderContent={<HeaderButtons />}
      />
    </UI.Wrapper>
  )
}
export default Layout
