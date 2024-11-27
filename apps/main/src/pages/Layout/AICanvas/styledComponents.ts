import styled from 'styled-components/macro'
import { Input as AntInput } from 'antd'

import { ArrowChevronRight } from '@acx-ui/icons'

import RuckusAiBackground from './assets/RuckusAiBackground.svg'
import CanvasBackground from './assets/CanvasBackground.svg'

export const ArrowChevronRightIcons = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  path {
    stroke: var(--acx-accents-blue-50);
  }
`
export const Wrapper = styled.div`
  &:hover {
    path {
      stroke: var(--acx-accents-blue-60);
    }
  }
`
export const MenuExpandArrow = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  margin: 0.3em;
`

export const Input = styled(AntInput.TextArea)`
  height: 28px;
  font-size: 12px;
  background: transparent;
  border: none;
  .ant-input::placeholder {
    color: var(--acx-neutrals-50);
  }
`

export const Preview = styled.div.attrs((props: {
  $siderWidth: string, $subToolbar:boolean
}) => props)`
animation: fadeIn 0.1s linear 0s both;
position: fixed; /* Stay in place */
z-index: 101; /* Sit on top */
padding-top: 100px; /* Location of the box */
left: 0;
top: 0;
width: 100%; /* Full width */
height: 100%; /* Full height */
overflow: auto; /* Enable scroll if needed */
background-color: transparent;
border-top: 75px solid rgba(255,255,255, 0.4);

.chat {
  position: fixed;
  width: 45%;
  top: 60px;
  z-index: 2;
  .header {
    border: 1px solid #E5E5E5;
    border-right: 0px;
    background-color: var(--acx-primary-white);
    height: 60px;
    padding: 15px 25px;
    display: flex;
    justify-content: space-between;
    .title{
      svg {
        margin-right: 10px;
       }
       padding: 5px;
       font-family: var(--acx-accent-brand-font);
       font-weight: var(--acx-headline-3-font-weight);
       font-size: var(--acx-headline-3-font-size);
    }
    .actions{
      button {
        margin-left: 15px;
      }
    }
  }
  .content {
    background-color: #fefefe;
    background-image: url(${RuckusAiBackground});
    background-repeat: no-repeat;
    height: calc(100vh - 120px);
    width: 45%;
    position: fixed;
    top: 120px;
    overflow: auto;
    display: flex;
    .widgets {
      width: 300px;
      border-left: 1px solid #E5E5E5;
      height: calc(100vh - 120px);
    }
    .chatroom {
      width: calc(100% - 300px);
      height: calc(100vh - 270px);
      overflow: auto;
      position: relative;
      .placeholder {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        div{
          background-color: var(--acx-primary-white);
          color: var(--acx-neutrals-80);
          border-radius: 15px;
          height: 30px;
          width: fit-content;
          padding: 7px 10px;
          margin: 7px auto;
          opacity: 0.6;
        }
      }
      .messages-wrapper {
        margin: 30px 10px;
      }
      .chat-container {
        display: flex;
      }
      .loading {
        display: flex;
        justify-content: center;
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
      }
      .chat-bubble {
        background: linear-gradient(275deg, #F7B605 -53.69%, #F79B06 -13.58%, #F65650 26.53%, #EC4C9A 66.65%, #A560FF 106.76%);
        color: #fff;
        width: fit-content;
        max-width: 80%;
        padding: 16px;
        border-radius: 16px 16px 16px 0px;
        margin: 7px;
      }
      .input {
        background-color: var(--acx-primary-white);
        height: 150px;
        position: fixed;
        bottom: 0;
        width: calc(45% - 300px);
        padding: 10px;
        button {
          position: fixed;
          left: calc(45% - 350px);
          bottom: 10px;
        }
      }
    }
  }
}

.canvas {
  position: fixed;
  width: 55%;
  top: 60px;
  z-index: 2;
  left: 45%;
  .header {
    border: 1px solid #E5E5E5;
    background-color: var(--acx-primary-white);
    height: 60px;
    display: flex;
    justify-content: space-between;
    padding: 15px 25px;
    .title{
       padding: 5px;
       font-family: var(--acx-accent-brand-font);
       font-weight: 500;
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
    height: calc(100vh - 120px);
    border-left: 1px solid #E5E5E5;
  }
}

.modal-content {
  background-color: #fefefe;
  width: 100%;
  height: calc(100vh - 120px);
  position: fixed;
  top: 120px;
  padding: 40px;
  padding-top: 40px;
  overflow: auto;
}

.ant-btn-text {
  &:not([disabled]):hover {
    background-color: var(--acx-neutrals-20);
  }
  &:not([disabled]):active {
    color: var(--acx-primary-white);
    background-color: var(--acx-neutrals-70);
    svg {
      path {
        stroke: var(--acx-primary-white);
      }
    }
  }
  &[disabled] {
    svg {
      path {
        stroke: var(--acx-neutrals-50);
      }
    }
  }
}

`