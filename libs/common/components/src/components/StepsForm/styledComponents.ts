
import { Col, Typography } from 'antd'
import styled, { css }     from 'styled-components/macro'

const stepCompletedStyle = css`
  .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon-dot {
    &::after {
      top: 1px;
      left: 1px;
      background-color: var(--acx-steps-form-steps-step-color);
    }
  }
`

export const Wrapper = styled.section<{ editMode?: boolean }>`
  --acx-steps-form-max-width: 1280px;
  --acx-steps-form-steps-container-max-width: 152px;
  --acx-steps-form-steps-title-color: var(--acx-primary-black);
  --acx-steps-form-steps-title-font-size: var(--acx-body-4-font-size);
  --acx-steps-form-steps-title-line-height: var(--acx-body-4-line-height);
  --acx-steps-form-steps-active-title-font-weight: 700;
  --acx-steps-form-steps-step-size: 12px;
  --acx-steps-form-steps-step-color: var(--acx-accents-orange-50);

  --acx-steps-form-form-title-font-size: var(--acx-headline-3-font-size);
  --acx-steps-form-form-title-font-weight: 500;
  --acx-steps-form-form-title-line-height: var(--acx-headline-3-line-height);
  --acx-steps-form-form-title-margin-bottom: 16px;

  --acx-steps-form-container-margin: 20px;

  --acx-steps-form-steps-container-margin:
    calc(
      var(--acx-steps-form-container-margin) +
      var(--acx-steps-form-form-title-line-height) +
      var(--acx-steps-form-form-title-margin-bottom) +
      2px
    )
    0
    var(--acx-steps-form-container-margin)
  ;

  .ant-pro-steps-form {
    position: relative;
    max-width: var(--acx-steps-form-max-width);
    // props enable the ActionsContainer to be sticky when use scroll
    display: flex;
    flex-direction: column-reverse;
    justify-content: start;
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

  // customize Steps component
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
`

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  font-size: var(--acx-steps-form-form-title-font-size);
  line-height: var(--acx-steps-form-form-title-line-height);
  font-weight: var(--acx-steps-form-form-title-font-weight);
  margin-bottom: var(--acx-steps-form-form-title-margin-bottom) !important;
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
  background-color: var(--acx-neutrals-10);
  z-index: 1;
`

export const ActionsContainer = styled.div`
  --acx-steps-form-steps-action-container-min-width: calc(
    100vw -
    var(--acx-sider-width) -
    var(--acx-content-horizontal-space) -
    var(--acx-steps-form-container-margin)
  );
  .ant-pro-basicLayout.sider-collapsed & {
    --acx-steps-form-steps-action-container-min-width: calc(
      100vw -
    var(--acx-sider-collapsed-width) -
      var(--acx-content-horizontal-space) -
      var(--acx-steps-form-container-margin)
    );
  }
  position: fixed;
  bottom: 0;
  padding-top: var(--acx-content-vertical-space);
  padding-bottom: var(--acx-content-vertical-space);
  padding-left: calc(
    var(--acx-steps-form-steps-container-max-width) +
    var(--acx-steps-form-container-margin)
  );
  width: var(--acx-steps-form-steps-action-container-min-width);
  max-width: min(
    var(--acx-steps-form-steps-action-container-min-width),
    var(--acx-steps-form-max-width)
  );
  display: flex;
  justify-content: flex-start;
  background-color: var(--acx-neutrals-10);
  z-index: 3; // to have it appear above other content
`

export const Container = styled.div`
  display: flex;
  .ant-pro-steps-form-container {
    margin: unset;
    margin: var(--acx-steps-form-container-margin);
    margin-left: calc(
      var(--acx-steps-form-steps-container-max-width) +
      var(--acx-steps-form-container-margin)
    );
    margin-bottom: calc(
      var(--acx-steps-form-container-margin) +
      32px // button height
    );
    margin-right: 0;
    width: unset;
    min-width: unset;
    flex: 1;
  }
`

export const FormContainer = styled(Col)<{ $state: 'active' | 'finish' | 'wait' }>`
  ${props => props.$state === 'wait' ? css`
    > * { display: none; }
    > .ant-typography:first-child { display: block; }
    > .ant-row:not(.ant-form-item) {
      display: block;
      .ant-col > * { display: none; }
      .ant-col:first-child > .ant-typography { display: block; }
    }
  ` : ''}
`
