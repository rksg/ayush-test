import { Col } from 'antd'
import styled  from 'styled-components/macro'

export const Diagram = styled.img`
  width: 220px;
  margin-top: 40px;
`

export const FieldText = styled.div`
  font-size: var(--acx-body-4-font-size);
`
export const ClusterSelectorHelper = styled(FieldText)`
  color: var(--acx-neutrals-60);
  margin-top: -4px;
  & svg {
    vertical-align: sub;
  }
`
export const VenueSelectorText = styled(FieldText)`
  margin-top: -10px;
  margin-bottom: var(--acx-select-item-top-padding);
`

export const VerticalSplitLine = styled(Col)`
  margin: auto 0;
  height: 350px;
  border-left: 1px solid var(--acx-neutrals-30);
`
