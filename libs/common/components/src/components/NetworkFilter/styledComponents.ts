import {
  Divider as AntDivider,
  Space as AntSpace,
  Checkbox as AntCheckbox
} from 'antd'
import styled from 'styled-components/macro'

export const Space = styled(AntSpace)`
  padding: 8;
`

export const Divider = styled(AntDivider)`
  margin: 0;
`
export const ButtonDiv = styled.div`
  background-color: #F8F8FA;
  text-align: right;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 8px 24px;
  gap: 12px;
`

export const RadioDiv = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0px;
`

export const Checkbox = styled(AntCheckbox)`
  padding: 2px;
`

export const Span = styled.span`
  padding: 2px;
`