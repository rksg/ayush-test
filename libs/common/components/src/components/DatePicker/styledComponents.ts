import { TimePicker, Space } from 'antd'
import styled                from 'styled-components/macro'

/* eslint-disable max-len */
export const Wrapper = styled.div`
  --acx-date-picker-ranges-width: 130px;

  > .ant-picker {
    width: 85%;
    background: var(--acx-neutrals-10);
    border-color: var(--acx-primary-black);
    > div:first-of-type {
      margin-left: 22px
    }
    > .ant-picker-suffix {
      position: absolute;
      left: 3px;
      width: 18px;
    }
    .ant-picker-active-bar {
      background: var(--acx-accents-blue-50);
      margin-left: 33px;
    }
  }

  .ant-picker-focused {
    box-shadow: none;
  }

  .ant-picker-dropdown {
    font-size: var(--acx-body-4-font-size);
    padding: 10px 0;
    & .ant-picker-panel { border: none; }
    & .ant-picker-header-super-prev-btn,
    & .ant-picker-header-super-next-btn {
      display: none;
    }

    .ant-picker-panel-container {
      border-radius: 4px;
      background: var(--acx-primary-white);
      box-shadow: 0px 6px 16px rgba(51, 51, 51, 0.2);
      padding-left: var(--acx-date-picker-ranges-width);
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

    .ant-picker-ranges {
      position: absolute;
      width: var(--acx-date-picker-ranges-width);
      top: 10px;
      bottom: 10px;
      left: 0px;
      display: flex;
      flex-direction: column;
      background-color:var(--acx-neutrals-10);
      padding: 20px;
      border-radius: 4px 0 0 4px;

      .ant-picker-preset > .ant-tag-blue {
        color: var(--acx-neutrals-100);
        background: var(--acx-neutrals-10);
        border-color: var(--acx-neutrals-10);
        cursor: pointer;
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
      border-color : var(--acx-accents-blue-50);
    }
    .ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single):not(.ant-picker-cell-range-end) .ant-picker-cell-inner,
    .ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single):not(.ant-picker-cell-range-start) .ant-picker-cell-inner {
      border-radius: 20px;
    }
    .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
      border-radius: 20px;
    }

    .ant-picker-footer {
      border-bottom: 0;
      .ant-picker-footer-extra {
        padding: 0;
        border-bottom: 0;
      }
    }
  }
`

export const TimePickerRow = styled.div`
  height: 48px;
  text-align: center;

  .ant-picker {
    background: transparent;
    border-color: var(--acx-neutrals-50);

    .ant-picker-input input {
      font-size: var(--acx-body-4-font-size);
    }
  }
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
  height: 24px;
  padding: 4px;
  width: 50px !important;

  .ant-picker-dropdown {
    .ant-picker-panel-container {
      padding-left: 0;
      & .ant-picker-footer {
        display: none;
      }
    }
    .ant-picker-time-panel-column {
      .ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
        background: var(--acx-accents-blue-10);
      }
      &::after {
        display: none;
      }
    }
  }
`

export const RangeApplyRow = styled.div`
  display: flex;
  background-color:var(--acx-neutrals-10);
  align-items: center;
  height: 48px;
`
export const SelectedRange = styled.div`
  flex: auto;
  text-align: center;
  font-size: var(--acx-subtitle-5-font-size);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`
export const Buttons = styled(Space).attrs({ size: 12 })`
  padding-right: 14px;
  .ant-space-item {
    line-height: normal;
  }
`
