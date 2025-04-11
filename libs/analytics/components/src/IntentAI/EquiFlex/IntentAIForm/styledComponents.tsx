import { Form } from 'antd'
import styled   from 'styled-components'

import { Loader } from '@acx-ui/components'

export const StyledFormItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    flex-direction: row;
    column-gap: 4px; // Prevent newline after tooltip text
    font-weight: var(--acx-headline-4-font-weight-bold);
  }
`

export const StyledLoader = styled(Loader)`
  height: var(--acx-subtitle-4-line-height);
`