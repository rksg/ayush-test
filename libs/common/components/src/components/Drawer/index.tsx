import { useState } from 'react'

import { DrawerProps as AntDrawerProps } from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'

import { CloseSymbol, ArrowBack } from '@acx-ui/icons'

import { Button } from '../Button'

import * as UI from './styledComponents'

interface DrawerHeaderProps {
  title: string,
  icon?: React.ReactNode,
  subTitle?: string,
  onBackClick?: () => void
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
  </>
}

export const Drawer = (props: DrawerProps) => {
  const { title, icon, subTitle, onBackClick, ...rest } = props
  const headerProps = { title, icon, subTitle, onBackClick }
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
  onCancel: (checked: boolean) => void
  onSave: (checked: boolean) => void
  buttonLabel?: {
    addAnother?: string
    cancel?: string
    save?: string
  }
}

const FormFooter = (props: FormFooterProps) => {
  const { $t } = useIntl()

  const {
    showAddAnother = false,
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

  const reset = () => {
    setChecked(false)
  }

  return (
    <UI.FooterBar>
      <div>
        {showAddAnother && <Checkbox
          onChange={(e: CheckboxChangeEvent) => setChecked(e.target.checked)}
          checked={checked}
          children={buttonLabel.addAnother}
        />}
      </div>
      <div>
        <Button
          key='cancelBtn'
          onClick={() => {
            reset()
            onCancel(checked)
          }}
        >
          {buttonLabel.cancel}
        </Button>
        <Button
          key='saveBtn'
          onClick={() => {
            reset()
            onSave(checked)
          }}
          type={'secondary'}
        >
          {buttonLabel.save}
        </Button>
      </div>
    </UI.FooterBar>
  )
}

Drawer.FormFooter = FormFooter
