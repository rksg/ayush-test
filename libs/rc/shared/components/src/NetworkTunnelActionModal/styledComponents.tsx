import { Button, Form, Typography } from 'antd'
import styled, { css }              from 'styled-components/macro'
const { Paragraph } = Typography

const RadioOptionPadding = css`
  margin-left: 20px;
`
export const RadioSubTitle = styled('div')`
  ${RadioOptionPadding}
`
export const SwitchContainer = styled('div')`
  ${RadioOptionPadding}
  margin-top: -15px;
`

export const StyledTitle = styled(Typography.Text)`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-3-font-size); 
`
// softGreDetail Drawer font Size is 13px, but above is set to 14 px

export const RadioWrapper = styled('div')`
  display: flex;
  align-items: center;
`
export const StyledParagraph = styled(Paragraph)`
  font-size: var(--acx-body-3-font-size);
  margin-bottom: 16px;
  margin-top: 2px;
`

export const TextButton = styled(Button)`
  font-size: var(--acx-body-4-font-size);
`

export const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0px;
`

export const FieldText = styled.div`
  font-size: var(--acx-body-4-font-size);
`

export const ClusterSelectorHelper = styled(FieldText)`
  & svg {
    vertical-align: sub;
  }
`