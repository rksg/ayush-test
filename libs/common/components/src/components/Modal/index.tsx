import { Modal as AntdModal, ModalProps as AntdModalProps } from 'antd'

import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'

interface ModalProps extends AntdModalProps {
  subTitle?: string
}

export function Modal ({ ...props }: ModalProps) {
  return (
    <AntdModal
      {...props}
      closeIcon={<CloseSymbol />}
      title={props.subTitle ? TitleWithSubtitle(props.title, props.subTitle) : props.title}
    />
  )
}

const TitleWithSubtitle = (title: React.ReactNode, subTitle: string) => {
  return (
    <>
      {title}
      <UI.SubTitleWrapper children={subTitle} />
    </>
  )
}