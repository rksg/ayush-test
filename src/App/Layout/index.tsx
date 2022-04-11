import React           from 'react'
import LayoutComponent from 'src/components/Layout'
import HeaderButtons   from './HeaderButtons'
import HeaderDropDown  from './HeaderDropDown'
import menuConfig      from './menuConfig'
import * as UI         from './styledComponents'

function Layout ({ content }: { content: React.ReactNode }) {
  return <UI.Wrapper>
    <LayoutComponent
      initPath={'/networks'}
      menuConfig={menuConfig}
      content={content}
      leftHeaderContent={
        <HeaderDropDown list={['MSP Space']} selected={'MSP Space'} />
      }
      rightHeaderContent={<HeaderButtons />}
    />
  </UI.Wrapper>
}
export default Layout
