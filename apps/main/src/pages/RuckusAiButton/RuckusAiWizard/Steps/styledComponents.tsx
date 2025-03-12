import ProForm from '@ant-design/pro-form'
import styled  from 'styled-components/macro'

import { ArrowChevronRight, CollapseCircleSolid, WarningTriangleSolid } from '@acx-ui/icons'

export const CheckboxIndexLabel = styled.div`
  display: inline-block;
  border: 1px solid;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  font-size: 10px;
  font-weight: 600;
  margin: 7px 5px;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`

export const Header = styled.div`
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const HeaderWithAddButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Title = styled.span`
  font-size: 24px;
  font-weight: 600;
  font-family: var(--acx-accent-brand-font);
`

export const Description = styled.span`
  font-size: 12px;
  color: var(--acx-neutrals-60);
  margin: 5px 0 30px 0;
`

export const StepItemCheckContainer = styled.div`
  display: grid;
  grid-template-columns: 45px 1fr;
`

export const StepItemContainer = styled.div`
  display: grid;
  grid-template-columns: 35px 1fr;
`

export const CheckboxContainer = styled.div`
  display: flex;
`

export const VlanDetails = styled.div`
  display: flex;
  flex-direction: column;
`

export const PurposeContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  background-color: var(--acx-accents-blue-10);
  padding: 10px 20px;
  flex-grow: 1;
  flex-direction: column;
  border-radius: 8px;
  margin-top: -8px;
  margin-bottom: 15px;

  ${(props) =>
    props.disabled &&
    `
     pointer-events: none;
      opacity: 0.6;
      cursor: not-allowed;
      ` }
`

export const ConfigurationContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  background-color: var(--acx-neutrals-15);
  padding: 10px 20px;
  flex-grow: 1;
  flex-direction: column;
  border-radius: 8px;
  margin-top: -8px;
  margin-bottom: 15px;
  cursor: pointer;
  font-size: 12px;

  ${(props) =>
    props.disabled &&
    `
     pointer-events: none;
      opacity: 0.6;
      cursor: not-allowed;
      ` }

  & > span {
    margin-left: 5px;
  }
`

export const NetworkName = styled.div`
  margin: 10px 0px;
  font-size: var(--acx-subtitle-5-font-size);
  font-weight: var(--acx-subtitle-5-font-weight);
`

export const PurposeHeader = styled.div`
  font-size: var(--acx-subtitle-5-font-size);
  font-weight: var(--acx-subtitle-5-font-weight);
  display: flex;
  align-items: center;

  & > span {
    margin-left: 5px;
  }
`


export const ConfigurationHeader = styled.div`
    display: flex;
    font-weight: 700;
    justify-content: space-between;
    width: -webkit-fill-available;
    align-items: center;
`

export const PurposeText = styled.div`
  font-size: 12px;
  margin: 5px 0 0 25px;
`

export const HighlightedBox = styled.div`
  display: flex;
  padding: 15px;
  background-color: var(--acx-accents-orange-10);
  flex-grow: 1;
  flex-direction: column;
  border-radius: 8px;
  margin: 20px 0;
`

export const HighlightedTitle = styled.div`
  font-size: var(--acx-subtitle-4-font-size);
  font-weight: var(--acx-subtitle-4-font-weight);
  display: flex;
  align-items: center;

  & > span {
    margin-left: 5px;
  }
`

export const HighlightedDescription = styled.div`
  font-size: var(--acx-subtitle-4-font-size);
  margin: 5px 0 0 25px;
`

export const ArrowChevronRightIcons = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
`

export const CollapseCircleSolidIcons = styled(CollapseCircleSolid)`
  width: 16px;
  height: 16px;
  fill: var(--acx-semantics-green-50);
  path {
    stroke: var(--acx-primary-white);
  }
`


export const RequiredIcon = styled.span`
  color: var(--acx-accents-orange-50);
  margin-left: 5px;

  &::after {
    content: '*';
  }
`

export const ConfiguredButton = styled.div`
  color: var(--acx-semantics-green-50);
  display: flex;
`

export const SetupButton = styled.div`
  color: var(--acx-accents-blue-50);
  font-weight: var(--acx-headline-5-font-weight);
`

export const SummaryContainer = styled.div`
  background-color: var(--acx-neutrals-15);
  border-radius: 8px;
  padding: 20px;
  margin: 0px 0px 20px 0px;
`

export const SummaryDescription = styled.span`
  font-size: var(--acx-subtitle-4-font-size);
  color: var(--acx-neutrals-60);
  margin: 10px 0px;
  font-family: var(--acx-neutral-brand-font);
`

export const SummaryContainerHeader = styled.span`
  font-size: var(--acx-subtitle-4-font-size);
  font-weight: var(--acx-subtitle-4-font-weight);
  color: var(--acx-primary-black);
  margin-bottom: 5px;
`

export const SummaryHeader = styled.span`
  font-size: var(--acx-subtitle-1-font-size);
  font-weight: var(--acx-subtitle-1-font-weight);
  font-family: var(--acx-accent-brand-font);
`

export const FooterValidationItem = styled(ProForm.Item)`
  height: 40px;
  margin-top: -45px;
  pointer-events: none;
  position: absolute;
  bottom: 5px;
  left: 85px;
  .ant-form-item-explain-error {
    color: var(--acx-primary-black);

  }
`
export const WarningTriangleSolidIcon = styled(WarningTriangleSolid)`
  height: 16px;
  margin-right: 3px;
  path:nth-child(1) {
    fill: var(--acx-semantics-yellow-50)
  }
  path:nth-child(3) {
    stroke: var(--acx-accents-orange-30);
  }
`

export const SummaryUl = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 0px;

  li::marker {
    font-size: 8px;
    color: var( --acx-primary-black);
  }
`

export const SummaryLi = styled.li<{ selected?: boolean }>`
  text-decoration-skip-ink: none;
  text-decoration-line: underline;
  margin-bottom: 5px;
  font-weight: var(--acx-headline-5-font-weight);
  cursor: pointer;

  ${(props) =>
    props.selected &&
    `
    color:  var(--acx-accents-orange-50);
    font-weight: var(--acx-headline-5-font-weight-bold);
      ` }

  &:hover {
    color:  var(--acx-accents-orange-50);
  }
`

export const VlanSummaryLi = styled.li`
  margin-bottom: 5px;
`

export const SummarySplitContainer = styled.div`
  display: flex;
  height: 100%;
`
export const SummaryDivider = styled.div`
  width: 1px;
  margin: 0 20px 0 20px;
  background-color: var(--acx-neutrals-40);
`

export const SummaryBox = styled.div`
  flex: 1;
  box-sizing: border-box;
  max-height: 440px;
  overflow-y: auto;
`
