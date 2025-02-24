import { useRef } from 'react'

import { Modal, Collapse, Form, Input } from 'antd'
import { TextAreaRef }                  from 'antd/lib/input/TextArea'
import { ModalFuncProps }               from 'antd/lib/modal'
import { pick, has }                    from 'lodash'
import moment                           from 'moment'
import { RawIntlProvider }              from 'react-intl'

import { ExpandSquareUp, ExpandSquareDown, CopyOutlined, ReportsOutlined, ReportsSolid } from '@acx-ui/icons'
import { getIntl, getEnabledDialogImproved }                                             from '@acx-ui/utils'

import { Button, ButtonProps } from '../Button'
import { Descriptions }        from '../Descriptions'
import { Tooltip }             from '../Tooltip'

import * as UI from './styledComponents'

const { Panel } = Collapse
const { TextArea } = Input

export type ActionModalType = 'info' | 'error' | 'confirm' | 'warning'

export const ActionModal = {
  copyableTextAreaStyle: UI.copyableTextArea,
  CopyButton: UI.CopyButton
}

type DeleteContent = {
  action: 'DELETE',
  entityName: string,
  entityValue?: string,
  numOfEntities?: number,
  confirmationText?: string,
  extraContent?: React.ReactNode
}

type ErrorContent = {
  action: 'SHOW_ERRORS',
  errorDetails?: ErrorDetailsProps,
  path?: string,
  errorCode?: number
}

type CustomButtonsContent = {
  action: 'CUSTOM_BUTTONS',
  buttons: CustomButtonProps[]
}

type CodeContent = {
  action: 'CODE',
  details: {
    expanded?: boolean
    label: string
    code: string
  }
}

export interface ActionModalProps extends ModalFuncProps {
  type: ActionModalType,
  customContent?: DeleteContent | ErrorContent | CustomButtonsContent | CodeContent,
}

export interface ModalRef {
  destroy: () => void;
  update: (configUpdate: ModalFuncProps) => void;
}

export interface ErrorDetailsProps {
  headers?: {
    normalizedNames?: object,
    lazyUpdate?: boolean
  },
  status?: number
  statusText?: string,
  url?: string,
  ok?: boolean,
  name?: string,
  message?: string,
  error?: string
}

export interface ErrorResponse {
  requestId: string,
  errors?: string
}

export interface CustomButtonProps {
  text: string,
  type: ButtonProps['type'],
  key: string,
  handler?: () => (void | Promise<void>);
  closeAfterAction?: boolean;
}

export const convertToJSON = (content: ErrorDetailsProps) => {
  return JSON.stringify(content, undefined, 2)
}

export const showActionModal = (props: ActionModalProps) => {
  const modal = Modal[props.type]({})
  const config = transformProps(props, modal)
  modal.update({
    ...config,
    content: <RawIntlProvider value={getIntl()} children={config.content} />,
    icon: <> </>
  })
  return pick(modal, 'destroy')
}

const transformProps = (props: ActionModalProps, modal: ModalRef) => {
  const { $t } = getIntl()
  const okText = $t({ defaultMessage: 'OK' })
  const cancelText = $t({ defaultMessage: 'Cancel' })
  const enabledDialogImproved = getEnabledDialogImproved()
  switch (props.customContent?.action) {
    case 'DELETE':
      const {
        numOfEntities = 1, entityName, entityValue, confirmationText, extraContent
      } = props.customContent

      const title = $t({
        defaultMessage: `Delete "{count, plural,
          one {{entityValue}}
          other {{count} {formattedEntityName}}
        }"?`
      }, { count: numOfEntities, formattedEntityName: entityName, entityValue })

      const content = (<>
        {$t({
          defaultMessage: `Are you sure you want to delete {count, plural,
            one {this}
            other {these}
          } {formattedEntityName}?`
        }, { count: numOfEntities, formattedEntityName: entityName })}
        {extraContent}
        {confirmationText && <ConfirmForm text={confirmationText} modal={modal} />}
      </>)
      props = {
        title, content,
        okText: $t(
          { defaultMessage: 'Delete {formattedEntityName}' },
          { formattedEntityName: entityName }
        ),
        okButtonProps: { disabled: Boolean(confirmationText) },
        ...props
      }
      break
    case 'SHOW_ERRORS':
      const { errorDetails, path, errorCode } = props.customContent
      props = {
        ...props,
        content: enabledDialogImproved ? <ApiErrorTemplate
          content={props.content}
          path={path}
          errorCode={errorCode}
          errors={errorDetails}
          modal={modal}
          onOk={props.onOk}
        /> : <ErrorTemplate
          content={props.content}
          path={path}
          errorCode={errorCode}
          errors={errorDetails}
          modal={modal}
          onOk={props.onOk}
        />,
        okText: ' ',
        className: 'modal-custom'
      }
      break
    case 'CUSTOM_BUTTONS':
      const { buttons } = props.customContent
      props = {
        ...props,
        content: <CustomButtonsTemplate content={props.content} buttons={buttons} modal={modal} />,
        okText: ' ',
        className: 'modal-custom'
      }
      break
    case 'CODE':
      props = {
        ...props,
        content: <CodeTemplate
          content={props.content}
          code={{
            expanded: props.customContent.details.expanded,
            label: props.customContent.details.label,
            content: props.customContent.details.code
          }}
          modal={modal}
          onOk={props.onOk}
        />,
        okText: ' ',
        className: 'modal-custom'
      }
      break
  }
  props.okText = props.okText?? okText
  props.cancelText = props.cancelText?? cancelText
  return props
}

function ErrorTemplate ({ errors, ...props }: {
  content: React.ReactNode,
  errors?: ErrorDetailsProps,
  path?: string,
  errorCode?: number,
  onOk?: () => void,
  modal: ModalRef
}) {
  const { $t } = getIntl()
  const code = errors && {
    label: $t({ defaultMessage: 'Technical details' }),
    content: convertToJSON(errors)
  }
  return <CodeTemplate {...props} code={code} />
}

function ApiErrorTemplate ({ errors, ...props }: {
  content: React.ReactNode,
  errors?: ErrorDetailsProps,
  path?: string,
  errorCode?: number,
  onOk?: () => void,
  modal: ModalRef
}) {
  const { $t } = getIntl()
  const code = errors && convertToJSON(errors)
  const okText = $t({ defaultMessage: 'OK' })
  return (
    <>
      {props.content && <UI.Content children={props.content} />}
      <UI.Footer>
        {code && <ApiCollapsePanel
          content={code}
          path={props.path}
          errorCode={props.errorCode}
        />
        }
        <UI.FooterButtons>
          <Button
            type='primary'
            onClick={() => {
              props.onOk?.()
              props.modal.destroy()
            }}
          >
            {okText}
          </Button>
        </UI.FooterButtons>
      </UI.Footer>
    </>
  )
}

function CodeTemplate (props: {
  content?: React.ReactNode
  path?: string,
  errorCode?: number,
  onOk?: () => void
  modal: ModalRef
  code?: {
    expanded?: boolean,
    label: string,
    content: string
  }
}) {
  const { $t } = getIntl()
  const okText = $t({ defaultMessage: 'OK' })
  return (
    <>
      {props.content && <UI.Content children={props.content} />}
      <UI.Footer>
        {props.code && <CollapsePanel
          expanded={props.code.expanded}
          header={props.code.label}
          content={props.code.content}
        />
        }
        <UI.FooterButtons>
          <Button
            type='primary'
            onClick={() => {
              props.onOk?.()
              props.modal.destroy()
            }}
          >
            {okText}
          </Button>
        </UI.FooterButtons>
      </UI.Footer>
    </>
  )
}

function CustomButtonsTemplate (props: {
  content: React.ReactNode,
  buttons?: CustomButtonProps[],
  modal: ModalRef
}) {
  const { $t } = getIntl()
  const destroyModal = () => props.modal.destroy()
  const handleClick = async (b: CustomButtonProps) => {
    try {
      if (b?.handler) await b.handler()
      if (b.key === 'cancel' || b?.closeAfterAction) destroyModal()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)

      showActionModal({
        type: 'error',
        title: $t(
          { defaultMessage: 'Failed to "{buttonLabel}"' },
          { buttonLabel: b.text }
        ),
        content: isErrorWithMessage(error)
          ? error.message
          : $t({ defaultMessage: 'Unknown Error' })
      })
    }
  }
  return (<>
    <UI.Content>{props.content}</UI.Content>
    <UI.Footer>
      <UI.FooterButtons>{
        props.buttons?.map((b: CustomButtonProps)=>{
          return (
            <Button
              type={b.type}
              key={b.key}
              onClick={() => handleClick(b)}
            >
              {b.text}
            </Button>
          )
        })
      }</UI.FooterButtons>
    </UI.Footer>
  </>)
}


function ApiCollapsePanel (props: {
  content: string
  path?: string
  errorCode?: number
}) {
  const inputEl = useRef<TextAreaRef>(null)

  const copyText = () => {
    navigator.clipboard.writeText(props.content)
    inputEl.current?.resizableTextArea?.textArea.select()
  }

  const getContent = function () {
    const { $t } = getIntl()
    const content = props.content
    const object = JSON.parse(content)
    const errorObj = object.errors?.[0] || {}
    return <UI.ErrorDescriptions labelWidthPercent={errorObj.suggestion? 26 : 28}
      contentStyle={{ alignItems: 'center' }}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'URL' })}
        children={props.path} />
      <Descriptions.Item
        label={$t({ defaultMessage: 'HTTP Code' })}
        children={props.errorCode} />
      {object.requestId &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'Requeset ID' })}
          children={object.requestId} />
      }
      <Descriptions.Item
        label={$t({ defaultMessage: 'Timestamp' })}
        children={moment().format('YYYYMMDD-HHmmss')} />
      {errorObj.code &&
         <Descriptions.Item
           style={{ paddingTop: '16px' }}
           label={$t({ defaultMessage: 'RUCKUS Code' })}
           children={errorObj.code} />
      }
      {errorObj.reason &&
         <Descriptions.Item
           label={$t({ defaultMessage: 'Reason' })}
           children={errorObj.reason || errorObj.message} />
      }
      {errorObj.suggestion &&
         <Descriptions.Item
           label={$t({ defaultMessage: 'Suggestion' })}
           children={errorObj.suggestion} />
      }
      { !(errorObj.reason || errorObj.suggestion ) &&
      <>
        <Descriptions.Item
          label={'Error Response'}
          children={''} />
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      </>
      }
    </UI.ErrorDescriptions>
  }

  const getExpandIcon = (isActive: boolean | undefined) => {
    const { $t } = getIntl()
    const iconStyle = {
      marginLeft: '-5px',
      height: '16px',
      marginBottom: '-10px'
    }

    return <Tooltip placement='top'
      title={
        $t({ defaultMessage: 'Show more details' })
      }>
      {isActive ? <ReportsSolid style={iconStyle} data-testid='activeButton' />:
        <ReportsOutlined style={iconStyle} data-testid='deactiveButton' />}
    </Tooltip>
  }

  return (
    <UI.Collapse
      ghost
      expandIconPosition='end'
      expandIcon={({ isActive }) => getExpandIcon(isActive)}
    >
      <Panel header={undefined} key={'ApiCollapsePanel'}>
        <div style={{
          backgroundColor: 'var(--acx-neutrals-10)',
          borderRadius: '4px' }}>
          {getContent()}
        </div>
        <UI.CopyButton
          type='link'
          data-testid='copyButton'
          onClick={copyText}
        >
          <CopyOutlined />
        </UI.CopyButton>
      </Panel>
    </UI.Collapse>
  )
}


function CollapsePanel (props: {
  header: string
  content: string
  expanded?: boolean
}) {
  const { $t } = getIntl()
  const inputEl = useRef<TextAreaRef>(null)
  const copyText = () => {
    navigator.clipboard.writeText(props.content)
    inputEl.current?.resizableTextArea?.textArea.select()
  }
  return (
    <UI.Collapse
      ghost
      expandIconPosition='end'
      expandIcon={({ isActive }) => isActive ? <ExpandSquareUp /> : <ExpandSquareDown />}
      defaultActiveKey={props.expanded ? [props.header] : undefined}
    >
      <Panel header={props.header} key={props.header}>
        <TextArea ref={inputEl} rows={20} readOnly={true} value={props.content} />
        <UI.CopyButtonLegacy
          type='link'
          onClick={copyText}
        >{$t({ defaultMessage: 'Copy to clipboard' })}</UI.CopyButtonLegacy>
      </Panel>
    </UI.Collapse>
  )
}

function ConfirmForm (props: {
  text: string,
  modal: ModalRef
}) {
  const { $t } = getIntl()
  const label = $t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: props.text })
  return (
    <Form>
      <Form.Item name='name' label={label}>
        <Input onChange={(e) => {
          const disabled = e.target.value.toLowerCase() !== props.text.toLowerCase()
          props.modal.update({
            okButtonProps: { disabled: disabled }
          })
        }} />
      </Form.Item>
    </Form>
  )
}

export function isErrorWithMessage <
  Result extends { message: string }
> (value: unknown): value is Result {
  if (value instanceof Error) return true
  if (has(value, 'message')) return true
  return false
}
