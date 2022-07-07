import { Modal as AntdModal } from 'antd'

import * as UI from './styledComponents'

export function Modal ({ ...props }) {
  return (
    <UI.Wrapper>
      <AntdModal
        {...props}
      />
    </UI.Wrapper>
  )
}
