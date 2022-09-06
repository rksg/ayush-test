import React from 'react'

import { useIntl } from 'react-intl'

import { Layout as LayoutComponent } from '@acx-ui/components'
import { SplitProvider }             from '@acx-ui/feature-toggle'
import { Outlet }                    from '@acx-ui/react-router-dom'
import { DateFilterProvider }        from '@acx-ui/utils'

import HeaderButtons     from './HeaderButtons'
import HeaderDropDown    from './HeaderDropDown'
import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const headerDropdownList = [
    $t({ defaultMessage: 'MSP Space' })
  ]
  return (
    <SplitProvider>
      <DateFilterProvider>
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
      </DateFilterProvider>
    </SplitProvider>
  )
}
export default Layout
