import { Input as AntInput, Badge as AntBadge } from 'antd'
import styled                                   from 'styled-components/macro'

import { Card } from '@acx-ui/components'

import CanvasBackground from './assets/CanvasBackground.svg'
import WaveBackground   from './assets/waves.svg'

export const Input = styled(AntInput.TextArea)`
  height: 28px;
  font-size: 12px;
  background: var(--acx-neutrals-10);
  border-radius: 16px;
  border: none;
  padding: 16px 62px 16px 16px;
  .ant-input::placeholder {
    color: var(--acx-neutrals-50);
  }
`
export const History = styled.div`
  .hint{
    font-style: italic;
    color: var(--acx-neutrals-60);
    font-size: 11px;
    line-height: 16px;
    position: absolute;
    bottom: 0px;
    text-align: center;
    padding: 10px 70px 25px 40px;
    margin-left: -20px;
    background: var(--acx-neutrals-10);
  }
  .duration {
    margin: 0 -20px;
    border-bottom: 1px solid var(--acx-neutrals-30);
    &:last-of-type {
      border: 0px;
    }
    &:first-of-type .time{
      margin-top: -30px;
    }
    .time {
      font-size: 10px;
      font-weight: 700;
      line-height: 16px;
      color: var(--acx-neutrals-60);
      padding: 12px 16px 6px 16px;
      cursor: default;
    }
    .chat {
      padding: 6px 8px 6px 16px;
      display: flex;
      justify-content: space-between;
      color: var(--acx-primary-black);
      &:hover {
        background: var(--acx-neutrals-30);
        .action {
          display: flex;
        }
      }
      &.active {
        background: var(--acx-neutrals-80);
        color: var(--acx-primary-white);
      }
      &.edit {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-gap: 10px;
        align-items: center;
        &.edit-input {
          width: 100%;
        }
        .ant-form-item {
          margin-bottom: 0;
        }
        .action {
          display: flex;
        }
        .button {
          &.confirm {
            color: #23AB36;
          }

          &.cancel {
            color: #ED1C24;
          }
        }
      }
      .title {
        overflow:hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 6px 5px 6px 0;
        cursor: pointer;
        font-size: var(--acx-body-4-font-size);
      }
      .action {
        display: none;
        height: 28px;
        padding-top: 6px;
        .button{
          margin: 0 8px;
          cursor: pointer;
        }
      }
    }
  }
`

export const Wrapper = styled.div`
animation: fadeIn 0.1s linear 0s both;
position: fixed; /* Stay in place */
z-index: 101; /* Sit on top */
padding-top: 100px; /* Location of the box */
left: 0;
top: 0;
width: 100%; /* Full width */
height: 100%; /* Full height */
background-color: transparent;
border-top: 75px solid rgba(255,255,255, 0.4);

.chat-wrapper {
  height: calc(100vh - 50px);
  background-color: var(--acx-primary-white);
}
.chat {
  background-color: var(--acx-primary-white);
  background-image: url(${WaveBackground});
  background-repeat: no-repeat;
  background-size: 401px 659px;
  position: fixed;
  width: 400px;
  height: calc(100vh - 50px);
  top: 60px;
  z-index: 2;
  .header {
    background-color: rgba(255, 255, 255, .4);
    height: 50px;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      display: flex;
      align-items: center;
      cursor: default;
      span {
        padding-left: 10px;
        font-family: var(--acx-accent-brand-font);
        font-weight: 700;
        font-size: var(--acx-headline-4-font-size);
      }
    }
    .actions{
      display: flex;
      align-items: center;
      width: 48px;
      justify-content: space-between;
      color: #000;
      svg {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
      .newChat {
        &.disabled {
          color: var(--acx-neutrals-50);
        }
      }
    }
  }
  .content {
    background: transparent;
    height: calc(100vh - 110px);
    width: 400px;
    position: fixed;
    top: 110px;
    overflow: auto;
    .chatroom {
      /* width */
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      /* Track */
      &::-webkit-scrollbar-track {
        border-radius: 6px;
        background: transparent; 
      }

      /* Handle */
      &::-webkit-scrollbar-thumb {
        background: var(--acx-neutrals-30);
        border-radius: 4px;
      }
      height: calc(100vh - 250px);
      overflow: auto;
      position: relative;
      margin-right: 4px;
      margin-top: 4px;
      .placeholder {
        position: fixed;
        bottom: 130px;
        width: 400px;
        left: 20px;
        div{
          background-color: var(--acx-accents-blue-50);
          color: var(--acx-primary-white);
          border-radius: 20px;
          height: 30px;
          width: fit-content;
          padding: 7px 12px;
          cursor: pointer;
          float: left;
          margin: 4px;
          &:hover{
            background-color: var(--acx-accents-blue-55);
          }
        }
      }
      .messages-wrapper {
        margin: 5px 10px 30px 10px;
        .ant-divider-inner-text {
          font-style: italic;
          color: var(--acx-neutrals-70);
          font-size: 11px;
          white-space: normal;
          line-height: 16px;
        }
        .ant-divider-horizontal.ant-divider-with-text {
          border-top-color: var(--acx-neutrals-30);
        }
        .ant-divider-horizontal.ant-divider-with-text::before, 
        .ant-divider-horizontal.ant-divider-with-text::after {
          width: 20%;
        }
      }
      .chat-container {
        display: flex;
      }
      .loading {
        display: flex;
        justify-content: center;
        margin-top: 10px;
      }
      .show-widgets{
        border-radius: 20px;
        border: 1px solid #5496EA;
        color: #5496EA;
        padding: 4px 8px;
        width: fit-content;
        margin-left: 7px;
        cursor: pointer;
      }
      .right.chat-container {
        justify-content: end;
      }
      .right .chat-bubble {
        border-radius: 16px 16px 0px 16px;
        background: #F8F8FA;
        border: 1px solid #D4D4D4;
        color: #000;
        margin-right: 0px;
        font-weight: 400;
      }
      .chat-bubble {
        background: linear-gradient(275deg, #F7B605 -53.69%, #F79B06 -13.58%,
          #F65650 26.53%, #EC4C9A 66.65%, #A560FF 106.76%);
        color: var(--acx-primary-white);
        width: fit-content;
        max-width: 90%;
        padding: 16px;
        border-radius: 16px 16px 16px 0px;
        margin: 7px;
        margin-left: 10px;
        font-weight: 600;
      }
      .timestamp {
        color: var(--acx-neutrals-70);
        display: flex;
        font-size: 10px;
        margin-left: 12px;
        margin-top: -5px;
        &.right{
          justify-content: end;
          margin-right: 2px;
        }
      }
      .input {
        background-color: var(--acx-primary-white);
        height: 130px;
        position: fixed;
        bottom: 0;
        width: 400px;
        padding: 10px 20px 20px 20px;
        .text-counter {
          position: absolute;
          right: 35px;
          bottom: 85px;
          color: var(--acx-neutrals-60);
        }
        button {
          min-width: 24px;
          width: 24px;
          height: 24px;
          position: absolute;
          right: 37px;
          bottom: 46px;
          border: 0px;
          background: var(--acx-accents-orange-50);
          &.ant-btn[disabled] {
            background: var(--acx-neutrals-30);
          }
          svg {
            width: 14px;
            height: 14px;
            path { stroke: var(--acx-primary-white); } }
          }
        }
      }
    }
  }
}

`

export const Canvas = styled.div`
  position: fixed;
  width: calc(100vw - 400px);
  top: 60px;
  z-index: 2;
  left: 400px;
  .header {
    border: 1px solid #E5E5E5;
    background-color: var(--acx-primary-white);
    height: 50px;
    display: flex;
    justify-content: space-between;
    padding: 8px 25px;
    .title{
      cursor: default;
      padding: 10px 0;
      font-family: var(--acx-accent-brand-font);
      font-weight: 700;
      font-size: var(--acx-headline-4-font-size);
    }
    .actions{
      button {
        margin-left: 15px;
        &.black{
          background-color: var(--acx-primary-black);
          color: var(--acx-primary-white);
        }
      }
    }
  }
  .grid {
    background-color: var(--acx-neutrals-30);
    background-image: url(${CanvasBackground});
    border-left: 1px solid #E5E5E5;
    height: calc(100vh - 110px);
    overflow: auto;
    /* width */
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
      border-radius: 6px;
      background: transparent; 
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      background: var(--acx-neutrals-30);
      border-radius: 4px;
    }
  }
`

export const Grid = styled.div`
.rglb_group-item {
  width: 100%;
  margin-bottom: 30px;
  // cursor: move;
  position: relative;
  transition: all 0.2s ease-out;
}
.rglb_group-item .group-item-container {
  padding: 20px;
}
.rglb_group-item .group-item-container #card-container .card-shadow {
  background: rgba(15, 15, 15, 0.3);
  position: absolute;
  border-radius: 8px;
  transition: all 0.2s ease-out;
}
.rglb_group-item .group-item-container #card-container .card {
  position: absolute;
  transition: all 0.2s ease-out;
  .card-actions{
    display: none;
    position: absolute;
    right: 0px;
    z-index: 1;
    background: var(--acx-primary-black);
    color: var(--acx-primary-white);
    padding: 8px;
    border-radius: 4px;
    margin: 8px;
    .icon{
      cursor: pointer;
      margin: 4px;
      width: 16px;
      height: 16px;
      svg{
        width: 16px;
        height: 16px;
      }
      &:hover {
        color: var(--acx-accents-orange-50);
      }
      &.disabled {
        color: var(--acx-neutrals-70);
        cursor: not-allowed;
      }
    }
  }
  &:hover .card-actions{
    display: flex;
  }
  .resizeHandle{
    position: absolute;
    bottom: 0;
    right: 0;
    cursor: se-resize;
    height: 20px;
    width: 20px;
    border-right: 2px solid #888;
    border-bottom: 2px solid #888;
  }
}
.rglb_group-item .group-item-container #card-container .card .card-footer {
  display: flex;
  justify-content: space-between;
  position: absolute;
  height: 35px;
  width: 100%;
  padding: 7px 8px;
  bottom: 0;
  background: #f2f2f2;
}
.rglb_group-item
  .group-item-container
  #card-container
  .card
  .card-footer
  .card-delete {
  font-size: 19px;
  line-height: 21px;
  cursor: pointer;
}

.rglb_custom-layer {
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: -20px;
  top: -20px;
}
.rglb_custom-layer .custom-layer-card-list .layer-card {
  width: 135px;
  height: 135px;
  border: 1px solid #cccccc;
  background: var(--acx-primary-white);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rglb_custom-layer .custom-layer-card-list .layer-card .layer-card-span {
  position: absolute;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: inline-block;
  text-align: center;
  line-height: 30px;
}
// .section {
//   background-color: var(--acx-accents-blue-10);
// }
`

export const Widget = styled(Card)`
  &.table .ant-card-body, &.table .ant-table-content {
    overflow: auto;
    /* width */
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
      border-radius: 6px;
      background: transparent; 
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      background: var(--acx-neutrals-30);
      border-radius: 4px;
      border-top: 1px solid var(--acx-primary-white);
    }
  }
  .chart {
    margin: 5px;
  }
`

export const Badge = styled(AntBadge)`
  .ant-badge-status-dot {
    height: 6px;
    width: 6px;
  }
  .ant-badge-status-text {
    margin-left: 4px;
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-body-5-font-size);
    line-height: var(--acx-body-5-line-height);
    color: var(--acx-primary-white);
    b {
      font-weight: var(--acx-body-font-weight-bold);
    }
  }
`
