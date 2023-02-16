import { Descriptions } from '@acx-ui/components'
import { PoeUsage, StackingPortSolid, TagsOutline, TagsSolid, UplinkPortSolid } from '@acx-ui/icons'
import styled from 'styled-components/macro'

export const TitleBar = styled.div`
  background: var(--acx-neutrals-10);
  height: 24px;
  text-align: right;
  padding: 0 16px;
`

export const SwitchFrontRearViewWrapper = styled.div`
  margin: 10px 0;
`

export const UnitWrapper = styled.div`
  display: flex;
  padding-top: 10px;
`

export const SlotWrapper = styled.div`
  float:left;
  margin-right: 20px;
`

export const SlotVertical = styled.div`
  height: 40px;
`

export const PortLabel = styled.div`
  line-height: var(--acx-body-4-font-size);
  text-align: center;
  font-size: var(--acx-body-4-font-size);
  color: var(--acx-neutrals-60);
`

export const PortWrapper = styled.div`
  float:left;
`

const getPortColor = (portColor: string) => {
  const colorMap:{[key:string]: string} = {
    lightgray: 'var(--acx-neutrals-25)',
    gray: 'var(--acx-neutrals-50)',
    green: 'var(--acx-semantics-green-50)'
  }
  return colorMap[portColor]
}

export const Port = styled.div<{ portColor: string }>`
  border-width: ${(props) => props.portColor === 'green' ? '2px' : '1px'};
  border-style: solid;
  border-color: ${(props) => getPortColor(props.portColor)};
  height: 20px;
  width: 20px;
  margin: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const StackingPortIcon = styled(StackingPortSolid)`
  height: 16px;
  width: 16px;
`

export const UplinkPortIcon = styled(UplinkPortSolid)`
  height: 16px;
  width: 16px;
`

export const PoeUsageIcon = styled(PoeUsage)`
  height: 10px;
`

export const TooltipStyle = styled(Descriptions)`
  .ant-descriptions-item-content, 
  .ant-descriptions-item .ant-descriptions-item-container .ant-descriptions-item-label {
    color: #fff;
  }
`

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 12px;
  height: 14px;
  vertical-align: middle;
  path {
    fill: #fff;
  }
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 12px;
  height: 14px;
  vertical-align: middle;
  margin-top: 5px;
  path {
    fill: #fff;
  }
`