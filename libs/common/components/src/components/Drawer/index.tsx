import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from 'antd'
import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'

export interface DrawerProps extends AntdDrawerProps {
  content?: React.ReactNode
}

export const Drawer = (props: DrawerProps) => {
  return (
    <UI.Wrapper>
      <AntdDrawer
        {...props}
        placement={'right'}
        mask={false}
        width={'400px'}
        closeIcon={<CloseSymbol />}
      >
        {props.content}
      </AntdDrawer>
    </UI.Wrapper>
    
  )
}
