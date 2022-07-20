import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from 'antd'

import { CloseSymbol, ArrowBack } from '@acx-ui/icons'

import * as UI from './styledComponents'

interface DrawerHeaderProps {
  title: string,
  icon?: React.ReactNode,
  subtitle?: string,
  onBackClick?: () => void
}

export interface DrawerProps extends
  Omit<AntdDrawerProps, 'title'|'placement'|'extra'>, DrawerHeaderProps {}

const Header = (props: DrawerHeaderProps) => {
  return <>
    {props.onBackClick
      ? <UI.BackButton onClick={props.onBackClick}><ArrowBack/>Back</UI.BackButton>
      : null
    }
    <UI.Title>
      {props.icon ? props.icon : null}
      {props.title}
    </UI.Title>
    {props.subtitle ? <UI.SubTitle>{props.subtitle}</UI.SubTitle> : null}
  </>
}

export const Drawer = (props: DrawerProps) => {
  const { title, icon, subtitle, onBackClick, ...rest } = props
  const headerProps = { title, icon, subtitle, onBackClick }
  return (
    <AntdDrawer
      {...rest}
      title={<Header {...headerProps}/>}
      placement='right'
      mask={false}
      width={props.width || '400px'}
      closeIcon={<CloseSymbol />}
    />
  )
}
