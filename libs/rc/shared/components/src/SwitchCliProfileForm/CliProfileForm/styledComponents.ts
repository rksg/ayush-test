import { Checkbox } from 'antd'
import styled       from 'styled-components/macro'

export const CodeMirrorContainer = styled('div')`
  .CodeMirror {
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-body-3-font-size);
    background: var(--acx-neutrals-15);
    padding: 11px 38px 0 8px;
  }
`

export const FamilyGroupPanel = styled('div')`
  height: 100%;
  background: #f0f0f0;
  padding: 32px 8px;
  font-size: 12px;
  margin-right: 24px;
  .ant-typography {
    display: block;
    margin-bottom: 20px;
  }
`

export const FamilyGroup = styled(Checkbox.Group)`
  .ant-checkbox-wrapper {
    margin: 0 0 10px;
  }
`

export const FamilyModelsGroup = styled(Checkbox.Group)`
  display: flex;
  height: 40vh;
  flex-flow: wrap;
  flex-direction: column;
  align-items: flex-start;

  .ant-checkbox-wrapper {
    margin: 0 0 12px;
  }
`