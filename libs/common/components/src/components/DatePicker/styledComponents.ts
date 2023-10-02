import { TimePicker, Space } from 'antd'
import styled                from 'styled-components/macro'

import { DateRange } from '@acx-ui/utils'

import { RangesType } from '.'

type RangePickerWrapperProps = {
  rangeOptions?: DateRange[]
  selectionType: DateRange
  isCalendarOpen: boolean
  rangeText: string
  timeRangesForSelection: RangesType
}

/* eslint-disable max-len */
const datePickerStyle = `
  .ant-picker-input {
    .ant-picker-clear {
      span[role=img] {
        svg { display: none; }

        &::after {
          content: '';
          display: inline-block;
          width: 14px;
          height: 14px;
          background-size: 12px 12px;
          // encodeURIComponent(renderToStaticMarkup(<Close />))
          background-image: url("data:image/svg+xml,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22NestedListSingle__CloseIcon-sc-1yefg1u-0%20lilJnS%22%3E%3Cpath%20d%3D%22M14.0625%203.9375L3.9375%2014.0625%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M14.0625%2014.0625L3.9375%203.9375%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: 50% 50%;
          background-color: white;
          margin-right: -4px;
        }
      }
    }
  }

  .ant-picker-dropdown {
    font-size: var(--acx-body-4-font-size);
    padding: 10px 0;
    & .ant-picker-panel {
      border: none;
    }

    .ant-picker-panel-container {
      border-radius: 4px;
      background: var(--acx-primary-white);
      box-shadow: 0px 6px 16px rgba(51, 51, 51, 0.2);
      padding-left: var(--acx-date-picker-ranges-width);
    }

    .ant-picker-panel {
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
      border-color: var(--acx-accents-blue-50);
    }
    .ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single):not(.ant-picker-cell-range-end) .ant-picker-cell-inner,
    .ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single):not(.ant-picker-cell-range-start) .ant-picker-cell-inner {
      border-radius: 20px;
    }
    .ant-picker-cell:hover .ant-picker-cell-inner,
    .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
      border-radius: 20px;
    }

    .ant-picker-footer {
      display: none;
    }
  }
`
/* eslint-enable */

export const Wrapper = styled.div`
  ${datePickerStyle}
`


export const RangePickerWrapper = styled(Wrapper)<RangePickerWrapperProps>`
  --acx-date-picker-ranges-width: 125px;
  --acx-date-picker-left-padding: 25px;

  > .ant-picker {
    &:not(.ant-picker-focused) {
      transition: width 1ms linear 500ms;
    }
    ${props => props.selectionType !== DateRange.custom && !props.isCalendarOpen
    ? `
        width: calc(var(--acx-date-picker-left-padding) + ${props.rangeText.length}ch);
        .ant-picker-range-separator, .ant-picker-input:nth-child(3) {
          display: none;
        }
      `
    : `
        width: 322px;
      `
}
    padding: 6px 11px 5px;
    background: var(--acx-primary-white);
    border-color: var(--acx-primary-black);
    > div:first-of-type {
      margin-left: var(--acx-date-picker-left-padding);
    }
    > .ant-picker-suffix {
      position: absolute;
      left: 8px;
      width: 16px;
    }
    .ant-picker-active-bar {
      background: var(--acx-accents-blue-50);
      margin-left: 33px;
    }
  }

  .ant-picker-dropdown {
    & .ant-picker-header-super-prev-btn,
    & .ant-picker-header-super-next-btn {
      display: none;
    }

    .ant-picker-footer {
      display: block;
      border-bottom: 0;

      .ant-picker-footer-extra {
        padding: 0;
        border-bottom: 0;
      }

      .ant-picker-ranges {
        li:nth-child(${
  (props) => props.rangeOptions
    ? props.rangeOptions.indexOf(props.selectionType) + 1
    : Object.keys(props.timeRangesForSelection).indexOf(props.selectionType) + 1}) {
          font-weight: var(--acx-body-font-weight-bold);
        }
        li {
          span.ant-tag {
            padding: 0;
            margin: 0;
          }
        }
        position: absolute;
        width: var(--acx-date-picker-ranges-width);
        top: 10px;
        bottom: 10px;
        left: 0px;
        display: flex;
        flex-direction: column;
        background-color: var(--acx-neutrals-10);
        padding: 10px 20px;
        border-radius: 4px 0 0 4px;
        .ant-picker-preset > .ant-tag-blue {
          color: var(--acx-neutrals-100);
          background: var(--acx-neutrals-10);
          border-color: var(--acx-neutrals-10);
          cursor: pointer;
        }
      }
    }
  }
`

export const TimePickerRow = styled.div`
  height: 48px;
  text-align: center;
`
export const TimePickerColon = styled.span`
  margin-left: 3px;
  margin-right: 3px;
`
export const TimePickerHyphen = styled.span`
  margin-left: 17px;
  margin-right: 17px;
`
export const TimePickerWrapper = styled(TimePicker)`
  width: 50px !important;

  .ant-picker-dropdown {
    .ant-picker-panel-container {
      padding-left: 0;
      & .ant-picker-footer {
        display: none;
      }
    }
    .ant-picker-time-panel-column {
      &::after {
        display: none;
      }
    }
  }
`

export const RangeApplyRow = styled.div`
  display: flex;
  background-color: var(--acx-neutrals-10);
  align-items: center;
  padding: var(--acx-modal-footer-small-padding);
`
export const SelectedRange = styled.div`
  flex: auto;
  text-align: center;
  font-size: var(--acx-subtitle-5-font-size);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`
export const Buttons = styled(Space)`
  gap: var(--acx-modal-footer-small-button-space) !important;
  .ant-space-item {
    line-height: normal;
  }
`

export const ApplyMsgWrapper = styled.div`
  padding: 0 12px;
  white-space: normal;
`

export const HiddenDateInput = styled.div`
  cursor: pointer;
  caret-color: transparent;

  ${datePickerStyle}

  .ant-picker-borderless {
    > .ant-picker-input > input {
      height: 0px;
      width: 0px;
      padding: 0px;
      position: absolute;
    }
    border: 0px;
    padding: 0px;
  }
  .ant-picker-panel {
    .ant-picker-footer {
      display: block;
      border-top: 0px;
    }
    .ant-picker-footer-extra {
      padding: 0px;
    }
  }
`

export const FooterWrapper = styled.div`
  line-height: 20px;
  font-size: 9.5px;
  margin-top: 5px;
  width: 280px;

  button {
    float: right;
    margin-top: 8px;
    margin-bottom: 8px;
    margin-right: 8px;
  }

  .ant-divider.ant-divider-horizontal {
    margin: 2px 0px;
  }

  ${TimePickerRow} {
    height: auto;
    padding-bottom: 10px;

    .ant-picker-footer {
      .ant-picker-ranges {
        display: none;
      }
    }
  }
`