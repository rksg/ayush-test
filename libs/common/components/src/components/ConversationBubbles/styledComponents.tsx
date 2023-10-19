import { Collapse as AntdCollapse } from 'antd'
import styled                       from 'styled-components/macro'

export const Collapse = styled(AntdCollapse)`
  width: 416px;
  border: 1px solid #E3E4E5;
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
    background: linear-gradient(0deg, #F7F7F7, #F7F7F7);
    border-bottom: none !important;
    padding: 10px !important;
    font-size: 14px !important;
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    align-items: stretch;
    .ant-collapse-expand-icon {
      display: flex;
      align-items: center;
      .ant-collapse-arrow {
        font-size: 18px;
      }
    }
  }
  .ant-collapse-header-text p {
    margin-bottom: 0;
    font-size: 13px;
    font-weight: normal;
    padding-top: 5px;
  }
`

export const Panel = styled(AntdCollapse.Panel)`
  .ant-collapse-header {
    padding: 13px 10px !important;
  }
  .ant-collapse-header > .ant-collapse-expand-icon > .ant-collapse-arrow {
    right: 18px !important;
  }
`

export const Wrapper = styled.div`
  border-radius: 8px;
  background: var(--acx-primary-white);
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
`
export const User = styled.div`
  width: 327px;
  height: auto;
  border: 1px solid #E3E4E5;
  border-radius: 5px;
  color: #333333;
  text-align: left;
  font-weight: 400;
  font-family: Open Sans;
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  margin-left: auto;
  margin-top: 16px;
  padding: 10px;
`
export const Bot = styled.div`
  width: 327px;
  height: auto;
  border: 1px solid #E3E4E5;
  border-radius: 5px;
  background: linear-gradient(0deg, #F7F7F7, #F7F7F7);
  color: #333333;
  ont-weight: 400;
  font-family: Open Sans;
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  margin-top: 16px;
  text-align: left;
  padding: 10px;
`

const ChatTypingWrapper = styled.div`
.typing {
  align-items: center;
  display: flex;
  height: 17px;
}
.typing .dot {
  animation: mercuryTypingAnimation 1.8s infinite ease-in-out;
  background-color: #E47B01 ; //rgba(20,105,69,.7);
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
    background-color: #E47B01;
  }
  28% {
    transform: translateY(-7px);
    background-color: #F7B41E;
  }
  44% {
    transform: translateY(0px);
    background-color: #FAD278;
  }
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

