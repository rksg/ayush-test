/* eslint-disable no-console */
import { LoadingOutlined } from '@ant-design/icons'
import * as _              from 'lodash'
import styled              from 'styled-components/macro'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { showToast, ToastProps, ToastType } from '@acx-ui/components'

import { rcToastTemplates } from './toast.template'

export enum TxStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  WAITING = 'WAITING' // Waiting to be executed
}

interface TxData {
  name: string
  value: string
}

export interface Transaction {
  requestId?: string
  method?: string
  entityId?: string
  count?: string
  status: TxStatus
  error?: unknown
  attributes?: {
    name: string
  }
  tenantId?: string
  descriptionTemplate: string
  descriptionData: TxData[]
  linkTemplate?: string
  linkData: TxData[]
  link?: string
  admin?: {
    name: string
    email: string
  }
  product?: string
  steps?: {
    id: string
    status: TxStatus
    progressType: string
    message: string
    startDatetime: string
    endDatetime: string
  }[]
  notifications?: {
    type: string
  }[]
  startDatetime: string
  endDatetime: string
  useCase: string
}

export interface ToastMessage {
  severity: ToastType
  summary: string
  detail?: string
  life?: number
  sticky?: boolean
  closable?: boolean
  data?: {
    tooltip?: string
    link?: string | null
    queryParams?: { tabView: string } | null
    isSwitchConfig?: boolean
    apSerialNumber?: number
    countdown?: boolean
  }
}

const TX_MAX_NAME_LENGTH = 45

const routeToPage = (link: string) => {
  window.location.href = link
}

const showDetails = () => {
  // TODO: params: message: {[key: string]: string}
  // Details Modal
  // if (this.dialogService.isModalShown('TechnicalDetailsDialogComponent')) {
  //   return;
  // }

  // this.dialogService.show('TechnicalDetailsDialogComponent', TechnicalDetailsDialogComponent, {
  //   message: message.detail
  // }).then(x => {
  //   this.dialogService.close('TechnicalDetailsDialogComponent');
  // });
}

const Countdown = styled.div`
  position: relative;
  .anticon {
    color: #fff;
    margin-left: 20px;
    font-size: 22px;
  }
`

const CountdownNumber = styled.span`
  font-size: var(--acx-body-4-font-size);
  font-weight: 700;
  position: absolute;
  top: 4px;
  right: 38%;
  transform: translateX(50%);
`

export const CountdownNode = (props: { n: number }) => (
  <Countdown>
    <LoadingOutlined />
    <CountdownNumber>{props.n}</CountdownNumber>
  </Countdown>
)

export const showTxToast = (tx: Transaction) => {
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
  let msg: ToastMessage
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
      break
    }
    default: {
      console.error('Invalid transaction status', tx)
      return
    }
  }
  let config: ToastProps = {
    type: msg.severity,
    content: msg.summary
  }
  if (msg.severity !== 'error' as ToastType) {
    config = {
      ...config,
      extraContent: <p>{msg.detail}</p>
    }
  } else {
    config = {
      ...config,
      link: { onClick: () => showDetails() }
    }
  }
  if (msg.data?.link) {
    config = {
      ...config,
      link: {
        onClick: () => routeToPage(msg.data?.link as string),
        text: msg.data.isSwitchConfig ? 'Check Status' : undefined
      }
    }
  }
  showToast(config)
}

const getToastMessage = (tx: Transaction): string => {
  let method = tx.method
  let message = parseMessage(tx.descriptionTemplate, tx.descriptionData)

  if (!message) {
    if (!method || !rcToastTemplates[method]) {  // template not found
      console.error(
        `Template not found for method ${method}, falling back to default messages. tx=`, tx)
      method = 'DefaultMethod'
    }
    return _.template(rcToastTemplates[method].messages[tx.status])(tx)
  }

  return message
}

const parseMessage = (messageTemplate: string, despData: TxData[], isHtml = false): string => {
  if (!despData) {
    return messageTemplate
  }

  despData.forEach((nameValuePair: TxData) => {
    const key = nameValuePair.name
    const value = nameValuePair.value
    const v = isHtml? `<span style="font-weight:bold;">${value}</span>` : value
    messageTemplate = messageTemplate.replace(`@@${key}`, v)
  })

  return messageTemplate
}

const getRouterLink = (tx:Transaction): string | null => {
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
  const tabId = method &&
    rcToastTemplates[method] &&
    _.template(rcToastTemplates[method].tabView)(tx)

  return (_.isEmpty(tabId))? null : { tabView: tabId }
}
