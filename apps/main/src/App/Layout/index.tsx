import React from 'react'

import { useIntl } from 'react-intl'

import { Layout as LayoutComponent } from '@acx-ui/components'

import HeaderButtons  from './HeaderButtons'
import HeaderDropDown from './HeaderDropDown'
import { getCols }    from './menuConfig'
import * as UI        from './styledComponents'

function Layout ({ content }: { content: React.ReactNode }) {
  const { $t } = useIntl()
  return (
    <UI.Wrapper>
      <LayoutComponent
        menuConfig={getCols(useIntl())}
        content={content}
        leftHeaderContent={
          <HeaderDropDown list={[$t({defaultMessage: 'MSP Space'})]} selected={'MSP Space'} />
        }
        rightHeaderContent={<HeaderButtons />}
      />
    </UI.Wrapper>
  )
}
export default Layout
