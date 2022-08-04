import React from 'react'

import { useIntl } from 'react-intl'

import { Layout as LayoutComponent } from '@acx-ui/components'

import HeaderButtons     from './HeaderButtons'
import HeaderDropDown    from './HeaderDropDown'
import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout ({ content }: { content: React.ReactNode }) {
  const { $t } = useIntl()
  const headerDropdownList = [
    $t({ defaultMessage: 'MSP Space' })
  ]
  return (
    <UI.Wrapper>
      <LayoutComponent
        menuConfig={useMenuConfig()}
        content={content}
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
