import { Input as AntInput } from 'antd'
import styled                from 'styled-components/macro'

import { ActionModal } from '@acx-ui/components'

const { TextArea } = AntInput

export const FailureTextArea = styled(TextArea)`
  ${ActionModal.copyableTextAreaStyle}
  margin-top: 10px;
`

export const CopyButton = ActionModal.CopyButton
