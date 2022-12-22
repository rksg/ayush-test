import { Button } from '@acx-ui/components'
import { WarningTriangleOutlined } from '@acx-ui/icons'
import styled from 'styled-components'

export const UpgradeNotification = styled.div`
  display: grid;
  margin: 8px 0 12px;
`

export const Wrapper = styled.div`
  grid-column: 2;
  border: 1px solid;
  border-color: var(--acx-neutrals-30);
  border-radius: 4px;
`

export const Header = styled.div`
  margin-bottom: 8px; 
  padding: 8px;
  border-bottom: 1px solid;
  border-color: var(--acx-neutrals-30);
`

export const ValidateModel = styled.span`
  font-weight: var(--acx-headline-5-font-weight-bold);
`

export const Content = styled.div`
  line-height: 1.6; 
  padding: 4px 8px 12px; 
  font-size: var(--acx-body-5-font-size);
`

export const MinFwVersion = styled.span`
  font-weight: var(--acx-headline-4-font-weight-bold);
`

export const Warning = styled.div`
  padding: 4px 0px;
  color: var(--acx-semantics-red-50);
`

export const LinkButton = styled(Button)`
  font-size: var(--acx-body-5-font-size);
`

export const WarningTriangle = styled(WarningTriangleOutlined)`
  margin-bottom: 3px;
  vertical-align: middle;
  height: 16px;
  width: 16px;
  margin-right: 3px;
`