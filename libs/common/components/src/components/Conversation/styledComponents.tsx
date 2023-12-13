import { Collapse as AntdCollapse } from 'antd'
import styled                       from 'styled-components/macro'

import { ChatbotLink } from '@acx-ui/icons'

import { cssStr }              from '../../theme/helper'
import { Button as AcxButton } from '../Button'

export const Button = styled(AcxButton)`
  text-wrap: wrap;
  margin-top: 16px;
  text-align: left;
  height: auto !important;
  width: 377px !important;
`

export const Collapse = styled(AntdCollapse)`
  width: 327px;
  border: 1px solid ${cssStr('--acx-neutrals-25')};
  margin-top: 16px;
  border-radius: 5px;
  .ant-collapse-content-box {
    padding: 0px 2px 2px 2px;
    border-top: none !important;
    text-align: center;
  }
  .ant-collapse-content {
    border-top: none !important;
  }
  .ant-collapse-item {
    border-bottom: none !important;
  }
  .ant-collapse-item .ant-collapse-header {
    background: linear-gradient(0deg,
       ${cssStr('--acx-neutrals-15')}, ${cssStr('--acx-neutrals-15')});
    border-bottom: none !important;
    padding: 10px !important;
    font-size: ${cssStr('--acx-headline-4-font-size')} !important;
    font-weight: ${cssStr('--acx-body-font-weight-bold')} !important;
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    align-items: stretch;
    .ant-collapse-expand-icon {
      display: flex;
      align-items: center;
      .ant-collapse-arrow {
        font-size: ${cssStr('--acx-headline-3-font-size')};
        transform: rotate(90deg) !important;
      }
    }
  }
  .ant-collapse-item.ant-collapse-item-active .ant-collapse-header {
    .ant-collapse-expand-icon {
      .ant-collapse-arrow {
        transform: rotate(180deg) !important;
      }
    }
  }
  .ant-collapse-header-text p {
    margin-bottom: 0;
    font-size: ${cssStr('--acx-headline-4-font-size')};
    font-weight: normal;
    padding-top: 5px;
  }
`

export const Panel = styled(AntdCollapse.Panel)`
  .ant-collapse-header {
    padding: 13px 10px !important;
  }
  .ant-collapse-header > .ant-collapse-expand-icon > .ant-collapse-arrow {
    right: 14px !important;
  }
`
export const Wrapper = styled.div`
  border-radius: 8px;
  background: ${cssStr('--acx-primary-white')};
  display: flex;
  flex-direction: column;
`
export const User = styled.div`
  width: max-content;
  max-width: 327px;
  height: auto;
  border: 1px solid #E3E4E5;
  border-radius: 10px 0px 10px 10px;
  background: ${cssStr('--acx-primary-white')};
  color: ${cssStr('--acx-primary-black')};
  font-weight: ${cssStr('--acx-body-font-weight')};
  font-family: ${cssStr('--acx-neutral-brand-font')};
  font-style: normal;
  font-size: ${cssStr('--acx-body-4-font-size')};
  line-height: ${cssStr('--acx-body-4-line-height')};
  margin-left: auto;
  margin-top: 10px;
  padding: 14px 15px;
`
export const Bot = styled.div`
  width: max-content;
  max-width: 327px;
  height: auto;
  border: none;
  border-radius: 0px 10px 10px 10px;
  background: #F5F8FB;
  color: ${cssStr('--acx-primary-black')};
  font-weight: ${cssStr('--acx-body-font-weight')};
  font-family: ${cssStr('--acx-neutral-brand-font')};
  font-style: normal;
  font-size: ${cssStr('--acx-body-4-font-size')};
  line-height: ${cssStr('--acx-body-4-line-height')};
  margin-top: 10px;
  text-align: left;
  padding: 14px 15px 14px 15px;
`

const ChatTypingWrapper = styled.div`
.typing {
  align-items: center;
  display: flex;
  height: 17px;
}
.typing .dot {
  animation: mercuryTypingAnimation 1.8s infinite ease-in-out;
  background-color: ${cssStr('--acx-semantics-yellow-70')};
  border-radius: 50%;
  height: 7px;
  margin-right: 4px;
  vertical-align: middle;
  width: 7px;
  display: inline-block;
}
.typing .dot:nth-child(1) {
  animation-delay: 200ms;
}
.typing .dot:nth-child(2) {
  animation-delay: 300ms;
}
.typing .dot:nth-child(3) {
  animation-delay: 400ms;
}
.typing .dot:last-child {
  margin-right: 0;
}

@keyframes mercuryTypingAnimation {
  0% {
    transform: translateY(0px);
    background-color: ${cssStr('--acx-semantics-yellow-70')};
  }
  28% {
    transform: translateY(-5px);
    background-color: ${cssStr('--acx-semantics-yellow-50')};
  }
  44% {
    transform: translateY(0px);
    background-color: ${cssStr('--acx-semantics-yellow-30')};
  }
}
`

export const StyledChatbotLink = styled(ChatbotLink)`
  width: unset !important;
  height: unset !important;
path {
    stroke: unset !important;
  }
`

export const ChatTyping=()=>{
  return(
    <ChatTypingWrapper>
      <div className='typing'>
        <div className='dot'></div>
        <div className='dot'></div>
        <div className='dot'></div>
      </div>
    </ChatTypingWrapper>
  )
}

