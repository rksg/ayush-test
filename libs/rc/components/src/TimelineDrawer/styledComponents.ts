import { Input as AntInput } from 'antd'
import styled                from 'styled-components/macro'

import { Button } from '@acx-ui/components'

const { TextArea } = AntInput

export const FailureTextArea = styled(TextArea)`
  background: var(--acx-neutrals-10);
  border: 1px solid var(--acx-neutrals-30);
  font-size: var(--acx-subtitle-6-font-size);
  line-height: var(--acx-subtitle-6-line-height);
  padding: 12px;
  max-height: 200px;
  resize: none;
  &:hover,
  &:focus {
    border-color: var(--acx-neutrals-30);
    box-shadow: none
  }
  margin-top: 10px;
`

export const CopyButton = styled(Button)`
  display: inline-flex;
  justify-content: flex-end;
  font-size: var(--acx-body-5-font-size);
  line-height: 16px;
  color: var(--acx-accents-blue-50);
  height: auto;
  margin: 4px 0 4px auto;
  justify-self: end;
`
