import { CloseOutlined, LoadingOutlined } from '@ant-design/icons'
import { message }                        from 'antd'
import * as _                             from 'lodash'
import styled                             from 'styled-components'
import { rcToastTemplates }               from './toast.template'

export enum TxStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  WAITING = 'WAITING' // Waiting to be executed
}

export interface Transaction {
  requestId?: string;
  method: string;
  entityId?: string;
  count?: string;
  status: TxStatus;
  error?: any;
  attributes?: any;
  tenantId?: string;
  descriptionTemplate?: string;
  descriptionData?: any[];
  linkTemplate?: string;
  linkData?: any[];
  link?:any
}

const CloseButton = styled.div`
 .anticon {
   color: var(--acx-primary-white);
   margin-right: 0;
   margin-left: 8px;
   font-size: 14px;
   cursor: pointer;
 }
`

const Toast = styled.div`
display: flex;
align-items: baseline;
.toast-style {
  width: 100%;
  display: flex;
  .toast-left-side {
    max-width: 600px;
  }
  .leading-text-style {
    font-size: 14px;
    font-weight: 600;
  }
  .toast-link {
    margin-left: 20px;
    text-decoration: underline;
    color: var(--acx-primary-white);
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  p-progressSpinner {
    float: right;
    margin-left: 20px;
    margin-top: 3px;
  }
}
.toast-style.toast-countdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .toast-left-side {
    float: none;
    width: 60%;
  }
  .close-countdown {
    color: $rw-blue-light;
    cursor: pointer;
    float: unset;
  }
  .countdown__block {
    .anticon {
      color: #fff;
      float: right;
      margin-left: 20px;
      font-size: 22px;
    }
    float: none;
    position: relative;
    p-progressSpinner {
      float: none;
      margin-left: unset;
      margin-top: unset;
    }
    .number {
      font-size: 12px;
      font-weight: bold;
      position: absolute;
      top: 4px;
      right: 38%;
      transform: translateX(50%);
    }
  }
}
`

const TX_MAX_NAME_LENGTH = 45

const routeToPage = (link:any) => {
  // window.location.href = link
}

const showDetails = (message: {[key: string]: string}) => {
  // TODO: Details Modal
  // if (this.dialogService.isModalShown('TechnicalDetailsDialogComponent')) {
  //   return;
  // }

  // this.dialogService.show('TechnicalDetailsDialogComponent', TechnicalDetailsDialogComponent, {
  //   message: message.detail
  // }).then(x => {
  //   this.dialogService.close('TechnicalDetailsDialogComponent');
  // });
}

const toastContainer = (key:string, content:any, callback?:Function) => {
  return (
    <Toast>
      {content}
      <CloseButton onClick={() => {
        message.destroy(key)
        if(callback) callback()
      }}><CloseOutlined /></CloseButton>
    </Toast>
  )
}

export const rcToastTemplate = (msg:any, test?:any) => {
  return (
    <div className={msg.data && msg.data.countdown ? 
      'toast-style toast-countdown' : 'toast-style'} >
      <label className='leading-text-style'>{msg.summary}</label>
      <div className='description-style'>
        { msg.severity !== 'error' ? <p>{msg.detail}</p> : 
          <button className='toast-link' onClick={() => showDetails(msg.data.link)}>
            Technical Details
          </button> 
        }
      </div>
      {
        msg.data && msg.data.countdown && (
          <div className='countdown__block'>
            <LoadingOutlined />
            <span className='number'>{test}</span>
          </div>
        )
      }
      { msg.data && msg.data.link && (
        <button className='toast-link' onClick={() => routeToPage(msg.data.link)}>
          {msg.data.isSwitchConfig ? 'Check Status' : 'View'}
        </button>
      )}
    </div>
  )
}

export const showTxToast = (tx:any) => {
  let tooltip
  if (tx.attributes && tx.attributes.name) {
    // calculate max_name_length
    const fullLength = getToastMessage(tx).length
    const msgLength = fullLength - tx.attributes.name.length - 3 // rest another 3 characters for the 3 points
    if (fullLength > TX_MAX_NAME_LENGTH) {
      const MAX_NAME_LENGTH = TX_MAX_NAME_LENGTH - msgLength
      tooltip = tx.attributes.name
      tx.attributes.name = (tx.attributes.name).substring(0, MAX_NAME_LENGTH) + '...'
    }
  }
  let msg
  switch (tx.status) {
    case TxStatus.SUCCESS: {
      msg = {
        severity: 'success',
        summary: getToastMessage(tx),
        data: {
          link: getRouterLink(tx),
          queryParams: getTabViewParams(tx),
          tooltip: tooltip
        }
      }
      showSuccessToast(tx.requestId, rcToastTemplate(msg))
      break
    }
    case TxStatus.FAIL: {
      msg = {
        severity: 'error',
        summary: getToastMessage(tx),
        detail: JSON.stringify({ requestId: tx.requestId, error: tx.error }, undefined, 2),
        data: {
          tooltip: tooltip
        }
      }
      showErrorToast(tx.requestId, rcToastTemplate(msg))
      break
    }
    default: {
      console.error('Invalid transaction status', tx)
      return
    }
  }
}

export const showInfoToast = (key:string, content:any, callback?:Function) => {
  message.info({
    className: 'toast-info',
    key,
    icon: <></>,
    content: toastContainer(key, content, callback),
    duration: 0
  })
}

export const showSuccessToast = (key:string, content:any) => {
  message.success({
    className: 'toast-success',
    key,
    icon: <></>,
    content: toastContainer(key, content),
    duration: 0
  })
}

export const showErrorToast = (key:string, content:any) => {
  message.error({
    className: 'toast-error',
    key,
    icon: <></>,
    content: toastContainer(key, content),
    duration: 0
  })
}

const getToastMessage = (tx: Transaction): string => {
  let method = tx.method
  let message = parseMessage(tx.descriptionTemplate, tx.descriptionData)

  if (!message) {
    if (!rcToastTemplates[method]) {  // template not found
      console.error(
        `Template not found for method ${method}, falling back to default messages. tx=`, tx)
      method = 'DefaultMethod'
    }
    return _.template(rcToastTemplates[method].messages[tx.status])(tx)
  }

  return message
}

const parseMessage = (messageTemplate: any, despData: any, isHtml = false): string => {
  if (!despData) {
    return messageTemplate
  }

  despData.forEach((nameValuePair: { name: any; value: any; }) => {
    const key = nameValuePair.name
    const value = nameValuePair.value
    const v = isHtml? `<span style="font-weight:bold;">${value}</span>` : value
    messageTemplate = messageTemplate.replace(`@@${key}`, v)
  })

  return messageTemplate
}

const getRouterLink = (tx:Transaction) => {
  if (tx.link) { // for guest service
    return tx.link
  }

  if (!tx.linkTemplate) {
    return null
  }

  return parseMessage(tx.linkTemplate, tx.linkData)
}

const getTabViewParams = (tx:Transaction) => {
  const method = tx.method
  const tabId = rcToastTemplates[method] && _.template(rcToastTemplates[method].tabView)(tx)

  return (_.isEmpty(tabId))? null : { tabView: tabId }
}