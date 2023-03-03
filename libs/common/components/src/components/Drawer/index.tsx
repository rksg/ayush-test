import { Fragment, ReactElement, useState } from 'react'

import { DrawerProps as AntDrawerProps, Space } from 'antd'
import Checkbox, { CheckboxChangeEvent }        from 'antd/lib/checkbox'
import { useIntl }                              from 'react-intl'

import { ArrowBack, CloseSymbol } from '@acx-ui/icons'

import { Button } from '../Button'

import * as UI from './styledComponents'

interface DrawerHeaderProps {
  title: string,
  icon?: React.ReactNode,
  subTitle?: string,
  onBackClick?: () => void
  extra?: ReactElement[]
}

export interface DrawerProps extends
  Omit<AntDrawerProps, 'title'|'placement'|'extra'|'footerStyle'>,
  DrawerHeaderProps {}

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
    {props.subTitle ? <UI.SubTitle>{props.subTitle}</UI.SubTitle> : null}
    {props.extra && <Space
      size={0}
      split={<UI.Divider type='vertical' />}
      style={{ display: 'flex', justifyContent: 'flex-end', margin: '3px 0' }}>
      {props.extra.map((item, index) => <Fragment key={index}>{item}</Fragment>)}
    </Space>}
  </>
}

export const Drawer = (props: DrawerProps) => {
  const { title, icon, subTitle, onBackClick, extra, ...rest } = props
  const headerProps = { title, icon, subTitle, onBackClick, extra }
  return (
    <UI.Drawer
      {...rest}
      title={<Header {...headerProps}/>}
      placement='right'
      mask={false}
      width={props.width || '336px'}
      closeIcon={<CloseSymbol />}
    />
  )
}

interface FormFooterProps {
  showAddAnother?: boolean
  showSaveButton?: boolean
  onCancel: () => void
  onSave: (checked: boolean) => Promise<void>
  buttonLabel?: {
    addAnother?: string
    cancel?: string
    save?: string
  }
}

const FormFooter = (props: FormFooterProps) => {
  const { $t } = useIntl()
  const [ loading, setLoading ] = useState(false)
  const {
    showAddAnother = false,
    showSaveButton = true,
    onCancel,
    onSave
  } = props
  const buttonLabel = {
    ...{
      addAnother: $t({ defaultMessage: 'Add another' }),
      cancel: $t({ defaultMessage: 'Cancel' }),
      save: $t({ defaultMessage: 'Save' })
    },
    ...props.buttonLabel
  }
  const [checked, setChecked] = useState(false)
  return (
    <>
      <div>
        {showAddAnother && <Checkbox
          onChange={(e: CheckboxChangeEvent) => setChecked(e.target.checked)}
          checked={checked}
          children={buttonLabel.addAnother}
        />}
      </div>
      <div>
        <Button onClick={onCancel}>
          {buttonLabel.cancel}
        </Button>
        {showSaveButton && <Button
          loading={loading}
          onClick={() => {
            setLoading(true)
            onSave(checked).finally(() => setLoading(false))
          }}
          type={'secondary'}
        >
          {buttonLabel.save}
        </Button>}
      </div>
    </>
  )
}

Drawer.FormFooter = FormFooter
