import styled from 'styled-components/macro'

export const OptionGroup = styled.div`
  .rc-virtual-list-holder {
    &-inner {
      .ant-select-item-group {
        text-align: center;
        span {
          position: relative;
          background: var(--acx-primary-white);
          padding: 4px;
        }        
        &:before {
          content: "";
          display: inline-block;
          position: absolute;
          height: 1px;
          width: calc(100% - 24px);
          background: var(--acx-neutrals-50);
          top: 50%;
          right: 12px;
        }
      }
      .ant-select-item-option-state {
        opacity: 0;
      }
    }
  }
  &.has-default-group {
    .rc-virtual-list-holder {
      &-inner {
        .ant-select-item-group:first-child {
          display: none;
        }
      }
    }
  }
  &.multiple {
    .rc-virtual-list-holder {
      &-inner {
        .ant-select-item-option-state {
          opacity: 1;
          position: absolute;
          left: 28px;
        }
        .ant-select-item-option {
          display: flex;
          position: relative;
          align-items: center;
          &:before {
            content: "";
            display: inline-block;
            border: 1px solid var(--acx-accents-blue-50);
            border-radius: 2px;
            width: 16px;
            height: 16px;
            margin-right: 7px;
          }
          &.ant-select-item-option-selected {
            &:before {
              background: var(--acx-accents-blue-50);
            }
            &:not(.ant-select-item-option-disabled) {
              background: var(--acx-primary-white);
            }
          }
        }
      }
    }
  }
`