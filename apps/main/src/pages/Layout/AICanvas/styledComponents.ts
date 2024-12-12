import { Input as AntInput } from 'antd'
import styled                from 'styled-components/macro'

import CanvasBackground   from './assets/CanvasBackground.svg'
import RuckusAiBackground from './assets/RuckusAiBackground.svg'

export const Input = styled(AntInput.TextArea)`
  height: 28px;
  font-size: 12px;
  background: transparent;
  border: none;
  .ant-input::placeholder {
    color: var(--acx-neutrals-50);
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
overflow: auto; /* Enable scroll if needed */
background-color: transparent;
border-top: 75px solid rgba(255,255,255, 0.4);

.chat {
  position: fixed;
  width: 350px;
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
    width: 350px;
    position: fixed;
    top: 120px;
    overflow: auto;
    .widgets {
      width: 300px;
      border-left: 1px solid #E5E5E5;
      height: calc(100vh - 120px);
    }
    .chatroom {
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
          cursor: pointer;
          &:hover{
            background-color: var(--acx-neutrals-10);
          }
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
      }
      .chat-bubble {
        background: linear-gradient(275deg, #F7B605 -53.69%, #F79B06 -13.58%, 
          #F65650 26.53%, #EC4C9A 66.65%, #A560FF 106.76%);
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
        width: 350px;
        padding: 10px;
        button {
          position: fixed;
          left: 300px;
          bottom: 10px;
        }
      }
    }
  }
}

`

export const Canvas = styled.div`
  position: fixed;
  width: calc(100vw - 350px);
  top: 60px;
  z-index: 2;
  left: 350px;
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
    border-left: 1px solid #E5E5E5;
    height: calc(100vh - 120px);
    overflow: auto;
  }
`

export const Grid = styled.div`
.rglb_group-item {
  width: 100%;
  margin-bottom: 30px;
  cursor: move;
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
  }
  &:hover .card-actions{
    display: block;
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
  background: #fff;
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