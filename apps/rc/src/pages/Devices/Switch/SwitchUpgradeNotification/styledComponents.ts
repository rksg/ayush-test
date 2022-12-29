import styled from 'styled-components'

import { Button, Subtitle }        from '@acx-ui/components'
import { WarningTriangleOutlined } from '@acx-ui/icons'

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
export const ListItems = styled.li`
  margin-top: 15px;
`

export const List = styled.ul`
 padding-inline-start: 20px;
 margin-bottom: 20px;
`
export const OrderList = styled.ol`
 padding-inline-start: 20px;
 margin-bottom: 20px;
`

export const CommandRectengle = styled.div`
  border: 1px solid var(--acx-neutrals-30);
  background-color: var(--acx-neutrals-10);
  margin-top: 5px;
  padding: 0 16px;
  line-height: 16px;
  font-size: 10px;
`
export const DescriptionBody = styled.body`
  margin-bottom: 12px;
`

export const SubTitle4 = styled(Subtitle)`
  margin-top: 16px;
`
