import styled from 'styled-components/macro'
import { TimePicker, Row, Col }     from 'antd'


type WrapperProps = {
  hasTimePicker?: boolean
}
/* eslint-disable max-len */
export const Wrapper = styled.div<WrapperProps>`

.ant-picker {
  background: var(--acx-neutrals-10);
  width: 85%;
  border-color: var(--acx-primary-black);
}
.acx-range-picker > div:first-of-type {
  margin-left: 22px
}
.acx-range-picker > .ant-picker-suffix {
  position: absolute;
  left: 3px;
  width: 18px;
}
.ant-picker:hover,
.ant-picker-focused  {
  border-color: var(--acx-accents-blue-50);
  box-shadow:  none;
}
.ant-picker-panel-container {
  border-radius: 4px;
  background: var(--acx-primary-white);
  box-shadow: 6px 2px 6px 2px rgb(51 51 51 / 5%), 6px 2px 6px 2px rgb(51 51 51 / 5%);
}
.ant-picker-date-panel {
  .ant-picker-header {
    align-items: baseline;
    border-bottom: none;
    .ant-picker-header-view {
      font-family: var(--acx-accent-brand-font);
      font-size: var(--acx-headline-5-font-size);
      font-weight: var(--acx-headline-5-font-weight-semi-bold);
      color: var(--acx-neutrals-70);
      button:hover {
        color: inherit;
        cursor: default;
      }
    }
  }
  .ant-picker-body {
    th {
      font-size: var(--acx-subtitle-6-font-size);
      font-weight: var(--acx-subtitle-6-font-weight-bold);
      color: var(--acx-neutrals-60);
    }
    td {
      font-size: var(--acx-subtitle-5-font-size);
      font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
    }
  }
}
.ant-picker-range .ant-picker-active-bar {
  background: var(--acx-accents-blue-50);
  margin-left: 33px;
}
.acx-range-picker-popup {
  font-size: var(--acx-body-4-font-size);
  & .ant-picker-panel {border: none;}
  & .ant-picker-header-super-prev-btn,
  & .ant-picker-header-super-next-btn {
    display: none;
}
& .acx-calender {
  font-size: var(--acx-body-4-font-size);
  & .ant-picker-footer {
    display: none;
  }
}
.ant-picker-ranges {
  position: absolute;
  left: -120px;
  width: 22%;
  display: flex;
  flex-direction: column;
  background-color:var(--acx-neutrals-10);
  height: ${(props) => (props.hasTimePicker ? '356px' : '318px')};
  padding: 20px;
  top: 9px;
  border-radius: 4px 0 0 4px;
  box-shadow:  -8px 2px 6px 4px rgb(51 51 51 / 5%), -8px 2px 6px -2px rgb(51 51 51 / 5%);
 }
.ant-picker-panels {
  background-color: var(--acx-primary-white);
  padding-left: 14px;
  padding-right: 12px;
}
.ant-picker-ranges .ant-picker-preset > .ant-tag-blue {
  color: var(--acx-neutrals-100);
  background: var(--acx-neutrals-10);
  border-color: var(--acx-neutrals-10);
  cursor: pointer;
}

.ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,
.ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
.ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
  color: var(--acx-primary-white);
  background: var(--acx-accents-blue-50);
  border-radius: 20px;
}
.ant-picker-cell-in-view. ant-picker-cell-range-hover .ant-picker-cell-inner::before,
.ant-picker-cell-in-view. ant-picker-cell-range-hover-start .ant-picker-cell-inner::before,
.ant-picker-cell-in-view. ant-picker-cell-range-hover-end .ant-picker-cell-inner::before {
  background: var(--acx-accents-blue-10);
}
.ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover::before,
.ant-picker-cell-in-view.ant-picker-cell-range-start.ant-picker-cell-range-hover::before,
.ant-picker-cell-in-view.ant-picker-cell-range-end.ant-picker-cell-range-hover::before,
.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single).ant-picker-cell-range-hover-start::before,
.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single).ant-picker-cell-range-hover-end::before,
.ant-picker-panel > :not(.ant-picker-date-panel) .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-start::before,
.ant-picker-panel > :not(.ant-picker-date-panel) .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-end::before,
.ant-picker-cell-in-view.ant-picker-cell-in-range::before,
.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single)::before,
.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single)::before {
  background: var(--acx-accents-blue-10);
}
.ant-picker-date-panel .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-start .ant-picker-cell-inner::after,
.ant-picker-date-panel .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-end .ant-picker-cell-inner::after {
  background: var(--acx-accents-blue-10);
}

.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
  border-color: var(--acx-accents-blue-50);
}
.ant-picker-cell-in-view.ant-picker-cell-range-hover:not(.ant-picker-cell-in-range)::after,
.ant-picker-cell-in-view.ant-picker-cell-range-hover-start:not(.ant-picker-cell-in-range)::after,
.ant-picker-cell-in-view.ant-picker-cell-range-hover-end:not(.ant-picker-cell-in-range)::after {
  border-color : var(--acx-accents-blue-50);
}
.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single):not(.ant-picker-cell-range-end) .ant-picker-cell-inner,
.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single):not(.ant-picker-cell-range-start) .ant-picker-cell-inner {
  border-radius: 20px;
}
.ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
  background: var(--acx-accents-blue-10);
}
.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
  border-radius: 20px;
}
.ant-picker-footer {
  .ant-picker {
    background: transparent;
    border-color: var(--acx-neutrals-50);
  }
  .ant-picker-input > input {
    font-size: var(--acx-body-4-font-size);
    padding-left: 4px;
  }
  div[role='display-date-range'] {
    font-size: var(--acx-subtitle-5-font-size);
    font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  }
  border-bottom: 0;
  .ant-picker-footer-extra {
    padding: 0;
    border-bottom: 0;
  }
}
.calender-range-apply-row {
  font-weight: var(--acx-body-font-weight);
}
`
export const TimePickerWrapper = styled(TimePicker)`
 height: 24px;
 padding: 4px;
 width: 50px !important;
`
export const TimePickerRow = styled(Row)`
 margin-left: 24px;
`
export const RangeApplyRow = styled(Row)`
 background-color:var(--acx-neutrals-10);
 height: 48px;
 align-items: center;
`
export const ButtonColumn = styled(Col)`
 line-height: normal
`
export const TimePickerCol1 = styled(Col)`
 margin-left: 3px;
 margin-right: 3px; 
`
export const TimePickerCol2 = styled(Col)`
 margin-left: 17px;
 margin-right: 17px; 
`
