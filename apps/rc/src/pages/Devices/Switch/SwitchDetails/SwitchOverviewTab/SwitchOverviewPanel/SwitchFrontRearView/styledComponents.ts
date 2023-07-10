import styled from 'styled-components/macro'

import { Descriptions }                                                                                                                          from '@acx-ui/components'
import { FanSolid, PoeUsage, StackingPortSolid, TagsOutline, TagsSolid, UplinkPortSolid, BreakoutPortSolid, LagMemberSolid, ConfigurationSolid } from '@acx-ui/icons'

export const TitleBar = styled.div`
  background: var(--acx-neutrals-10);
  height: 24px;
  display: flex;

  .unit-header {
    background-color: var(--acx-primary-black);
    color: var(--acx-primary-white);
    height: 24px;
    width: 24px;
    line-height: 24px;
    text-align: center;

    &.operational {
      background-color: var(--acx-semantics-green-50);
    }
  }

  .model {
    width: 180px;
    padding: 0 20px 0 8px;
    line-height: 24px;
  }

  .icon {
    padding: 2px;
  }

  .status {
    font-size: 12px;
    line-height: 24px;
    padding-right: 20px;
  }

  .unit-button {
    background-color: var(--acx-neutrals-50);
    color: var(--acx-primary-white);
    text-align: center;
    padding: 2px 12px;
    margin-top: 3px;
    margin-right: 50px;

    &:hover:not([disabled]) {
      cursor: pointer;
    }
  }

  .view-button {
    flex-grow: 1;
    text-align: end;
    padding: 1px 25px 0 0;
  }
`

export const SwitchFrontRearViewWrapper = styled.div`
  margin: 10px 0;
  min-height: 115px;
`

export const RearSlotWrapper = styled.div`
  display: grid;
  align-items: end;
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

export const RearViewWrapper = styled.div`
  float:left;
`

const getPortColor = (portColor: string) => {
  const colorMap:{ [key:string]: string } = {
    lightgray: 'var(--acx-neutrals-25)',
    gray: 'var(--acx-neutrals-50)',
    green: 'var(--acx-semantics-green-50)'
  }
  return colorMap[portColor]
}

export const Port = styled.div<{ portColor: string }>`
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => getPortColor(props.portColor)};
  height: 20px;
  width: 20px;
  margin: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const BreakOutPortFlag = styled.div<{ portColor: string }>`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 5px 5px;
  border-color: transparent transparent  ${(props) => getPortColor(props.portColor)} transparent;
  left: 12px;
  top: 16px;
  position: absolute;
`

export const StackingPortIcon = styled(StackingPortSolid)`
  height: 16px;
  width: 16px;
`

export const UplinkPortIcon = styled(UplinkPortSolid)`
  height: 16px;
  width: 16px;
`

export const BreakoutPortIcon = styled(BreakoutPortSolid)`
  height: 16px;
  width: 16px;
`

export const LagMemberIcon = styled(LagMemberSolid)`
  height: 16px;
  width: 16px;
`

export const PoeUsageIcon = styled(PoeUsage)`
  height: 16px;
  width: 16px;
`

export const TooltipStyle = styled(Descriptions)`
  .ant-descriptions-item-content,
  .ant-descriptions-item .ant-descriptions-item-container .ant-descriptions-item-label {
    color: var(--acx-primary-white);
  }
`

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 12px;
  height: 14px;
  vertical-align: middle;
  path {
    fill: var(--acx-primary-white);
  }
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 12px;
  height: 14px;
  vertical-align: middle;
  margin-top: 5px;
  path {
    fill: var(--acx-primary-white);
  }
`

export const SettingsIcon = styled(ConfigurationSolid)`
  height: 18px;
`

const getRearColor = (rearColor: string) => {
  const colorMap:{ [key:string]: string } = {
    gray: 'var(--acx-neutrals-50)',
    red: 'var(--acx-semantics-red-60)',
    green: 'var(--acx-semantics-green-50)'
  }
  return colorMap[rearColor]
}

const getRearLabelColor = (labelColor: string) => {
  const colorMap:{ [key:string]: string } = {
    gray: 'var(--acx-neutrals-50)',
    black: 'var(--acx-primary-black)'
  }
  return colorMap[labelColor]
}

export const Rear = styled.div<{ rearColor: string }>`
  border-width: 2px;
  border-style: solid;
  border-color: ${(props) => getRearColor(props.rearColor)};
  height: 35px;
  width: 120px;
  padding: 0 4px;
  margin: 4px;
  display: flex;
  align-items: center;
`

export const RearDescrption = styled.div<{ labelColor: string }>`
  margin-left: 4px;
  margin-top: 4px;
  color: ${(props) => getRearLabelColor(props.labelColor)};
  .slot {
    font-size: 12px;
    line-height: 12px;
  }
  .status {
    font-weight: 600;
    line-height: 16px;
  }
`

export const RearPowerIcon = styled(PoeUsage)`
  height: 18px;
  width: 18px;
  path {
    fill: var(--acx-primary-black);
  }
`

export const RearFanIcon = styled(FanSolid)`
  height: 18px;
  path {
    fill: var(--acx-primary-black);
  }
`

export const BreakOutPortTagsOutlineIcon = styled(TagsOutline)`
  width: 14px;
  height: 16px;
  vertical-align: middle;
`
export const BreakOutPortTagsSolidIcon = styled(TagsSolid)`
  width: 14px;
  height: 16px;
  vertical-align: middle;
  margin-left: 6px;
`
export const BreakoutPortTooltipContainer = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const BreakoutPortTooltipHeader = styled.div`
  padding-bottom: var(--acx-descriptions-space);
  color: var(--acx-neutrals-40);
`

export const BreakoutPortTooltipItem = styled.div`
  grid-template-columns: auto auto;
  display: grid;
  padding-bottom: var(--acx-descriptions-space);
`

export const BreadkoutPortContainer = styled.div`
  position: relative;
  cursor: pointer;
  font-size: 10px;
  svg {
    margin-top: 3px;
  }
`

export const RegularPortContainer = styled.div`
  position: relative;
  cursor: pointer;
  font-size: 10px;
  div {
    margin-top: 3px;
    left: 4px;
    top: 2px;
  }
`
