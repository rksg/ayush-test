import { Typography }  from 'antd'
import styled, { css } from 'styled-components/macro'

const stepCompletedStyle = css`
  .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon-dot {
    &::after {
      top: 1px;
      left: 1px;
      background-color: var(--acx-steps-form-steps-step-color);
    }
  }
`

export const StepsContainer = styled.div`
  position: fixed;
  display: block;
  padding: var(--acx-steps-form-steps-container-margin);
  padding-left: var(--acx-content-horizontal-space);
  margin-left: calc(-1 * var(--acx-content-horizontal-space));
  height: 100%;
  width: 100%;
  max-width: var(--acx-steps-form-steps-container-max-width);
  z-index: 1;
`

export const ActionsContainer = styled.div`
  position: fixed;
  bottom: 0;
  padding: var(--acx-content-vertical-space) 0;
  margin-right: var(--acx-content-horizontal-space);
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;
  background-color: var(--acx-neutrals-10);
  z-index: 3;
  &&::before {
    content: '';
    position: absolute;
    inset: 0 -100% 0 -100%;
    background-color: var(--acx-neutrals-10);
  }
  .ant-space-item .ant-space {
    position: absolute;
    left: 50%;
    bottom: var(--acx-content-vertical-space);
    transform: translate(-50%, 0);
  }
`

export const Wrapper = styled.section<{
  singleStep: boolean,
  editMode?: boolean
}>`
  --acx-steps-form-steps-container-max-width: 152px;
  --acx-steps-form-steps-title-color: var(--acx-primary-black);
  --acx-steps-form-steps-title-font-size: var(--acx-body-4-font-size);
  --acx-steps-form-steps-title-line-height: var(--acx-body-4-line-height);
  --acx-steps-form-steps-active-title-font-weight: var(--acx-body-font-weight-bold);
  --acx-steps-form-steps-step-size: 12px;
  --acx-steps-form-steps-step-color: var(--acx-accents-orange-50);

  --acx-steps-form-form-title-font-size: var(--acx-headline-3-font-size);
  --acx-steps-form-form-title-font-weight: var(--acx-headline-3-font-weight);
  --acx-steps-form-form-title-line-height: var(--acx-headline-3-line-height);
  --acx-steps-form-form-title-margin-bottom: 16px;

  --acx-steps-form-steps-container-margin:
    calc(
      var(--acx-steps-form-form-title-line-height) +
      var(--acx-steps-form-form-title-margin-bottom) +
      2px
    )
    0 0 0
  ;

  .ant-pro-steps-form {
    position: relative;
  }
  .ant-pro-steps-form-step {
    position: initial;
    display: none;
    margin-top: unset;
    &.ant-pro-steps-form-step-active {
      display: block;
    }
  }

  // resetting due to it causes extra space out of box
  .ant-descriptions-view table { table-layout: initial; }

  ${props => props.singleStep && css`
    ${StepsContainer} {
      display: none;
    }
  `}
  .ant-steps-dot {
    .ant-steps-item {
      .ant-steps-item-title {
        padding: 0 0 var(--acx-steps-form-steps-title-line-height) 12px;
        line-height: var(--acx-steps-form-steps-title-line-height);
        font-size: var(--acx-steps-form-steps-title-font-size);
      }
      &.ant-steps-item-active .ant-steps-item-title {
        font-weight: var(--acx-steps-form-steps-active-title-font-weight);
      }
      .ant-steps-item-title,
      &.ant-steps-item-wait .ant-steps-item-title {
        color: var(--acx-steps-form-steps-title-color);
      }

      .ant-steps-item-container {
        .ant-steps-item-tail {
          top: 3px;
          left: unset;
          width: var(--acx-steps-form-steps-step-size);
          padding: 11px 0 0;

          &::after {
            margin: 0 auto;
            display: block;
            ${props => !props.editMode ? css`
              background-color: var(--acx-steps-form-steps-step-color);
            ` : css`
              display: none;
            `}
          }
        }

        .ant-steps-item-content {
          min-height: calc(var(--acx-body-4-line-height) * 2);
        }
      }


      .ant-steps-item-icon {
        width: var(--acx-steps-form-steps-step-size);
        height: var(--acx-steps-form-steps-step-size);
        top: unset;
        margin-top: 3px;
        margin-right: 0px;

        .ant-steps-icon-dot {
          width: var(--acx-steps-form-steps-step-size);
          height: var(--acx-steps-form-steps-step-size);
          border: 1px solid var(--acx-steps-form-steps-step-color);
          background-color: transparent;
          top: unset;
          left: unset;

          &::after {
            top: 0;
            left: 0;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: transparent;
            transition-property: top, left, background-color;
          }
        }
      }
      &.ant-steps-item-active .ant-steps-item-icon .ant-steps-icon-dot {
        top: unset;
        left: unset;
        &::after {
          width: 10px;
          height: 10px;
          background-color: var(--acx-steps-form-steps-step-color);
        }
      }
      &.ant-steps-item-finish {
        ${stepCompletedStyle}
      }
      ${props => props.editMode ? css`
        &.ant-steps-item-wait  {
          ${stepCompletedStyle}
        }
      ` : ''}
    }
  }

  .ant-pro-steps-form-container {
    margin: unset;
    margin-left: ${props => props.singleStep
    ? '0;'
    : `calc(
        var(--acx-steps-form-steps-container-max-width) +
        20px
      );`}
    // 20px = gutter
    margin-bottom: calc(
      var(--acx-content-vertical-space) * 2 +
      32px
    );
    // 32px = button height
    margin-right: 0;
    width: unset;
    min-width: unset;
    flex: 1;
  }

  ${ActionsContainer}
`

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  font-size: var(--acx-steps-form-form-title-font-size);
  line-height: var(--acx-steps-form-form-title-line-height);
  font-weight: var(--acx-steps-form-form-title-font-weight);
  margin-bottom: var(--acx-steps-form-form-title-margin-bottom) !important;
`

