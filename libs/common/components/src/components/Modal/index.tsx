import { ModalProps as AntModalProps } from 'antd'
import { useIntl }                     from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import { Button, ButtonProps } from '../Button'

import * as UI from './styledComponents'

interface ModalProps extends AntModalProps {
  title: string
  subTitle?: string
}

export function Modal ({
  footer,
  onCancel,
  cancelText,
  cancelButtonProps,
  onOk,
  okText,
  okButtonProps,
  ...props
}: ModalProps) {
  const { $t } = useIntl()
  if (!footer) {
    footer = [
      <Button {...cancelButtonProps as ButtonProps} key='cancel' onClick={onCancel}>
        {cancelText || $t({ defaultMessage: 'Cancel' })}
      </Button>,
      <Button {...okButtonProps as ButtonProps} key='ok' onClick={onOk} type='secondary'>
        {okText || $t({ defaultMessage: 'OK' })}
      </Button>
    ]
  }
  return (
    <UI.Modal
      {...props}
      onCancel={onCancel}
      closeIcon={<CloseSymbol />}
      title={props.subTitle ? TitleWithSubtitle(props.title, props.subTitle) : props.title}
      footer={footer}
    />
  )
}

const TitleWithSubtitle = (title: string, subTitle: string) => {
  return (
    <>
      {title}
      <UI.SubTitleWrapper children={subTitle} />
    </>
  )
}
