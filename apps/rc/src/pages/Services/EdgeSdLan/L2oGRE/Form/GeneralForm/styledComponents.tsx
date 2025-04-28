import { Col, Row } from 'antd'
import styled       from 'styled-components/macro'

import { SdLanTopologyVertical } from '@acx-ui/edge/components'

export const Wrapper = styled(Row)`
  margin-top: 30px;
`

export const StyledSdLanTopology = styled(SdLanTopologyVertical)`
  padding-right: 50px
`

export const FieldText = styled.div`
  font-size: var(--acx-body-4-font-size);
`
export const ClusterSelectorHelper = styled(FieldText)`
  & svg {
    vertical-align: sub;
  }
`

export const VerticalSplitLine = styled(Col)`
  margin: auto 0;
  height: 350px;
  border-left: 1px solid var(--acx-neutrals-30);
`
export const FlexEndCol = styled(Col)`
  display: flex;
  justify-content: end;
`