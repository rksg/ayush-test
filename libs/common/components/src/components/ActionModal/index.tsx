import { useRef } from 'react'

import { Modal, Collapse, Form, Input } from 'antd'
import { TextAreaRef }                  from 'antd/lib/input/TextArea'
import { ModalFuncProps }               from 'antd/lib/modal'
import { pick, has }                    from 'lodash'

import { ExpandSquareUp, ExpandSquareDown } from '@acx-ui/icons'
import { getIntl }                          from '@acx-ui/utils'

import { Button, ButtonProps } from '../Button'

import * as UI from './styledComponents'

const { Panel } = Collapse
const { TextArea } = Input

export type ModalType = 'info' | 'error' | 'confirm' | 'warning'

type DeleteContent = {
  action: 'DELETE',
  entityName: string,
  entityValue?: string,
  numOfEntities?: number,
  confirmationText?: string
}

type ErrorContent = {
  action: 'SHOW_ERRORS',
  errorDetails: ErrorDetailsProps
}

type CustomButtonsContent = {
  action: 'CUSTOM_BUTTONS',
  buttons: CustomButtonProps[]
}

export interface ModalProps extends ModalFuncProps {
  type: ModalType,
  customContent?: DeleteContent | ErrorContent | CustomButtonsContent
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

export const showActionModal = (props: ModalProps) => {
  const modal = Modal[props.type]({})
  const config = transformProps(props, modal)
  modal.update({
    ...config,
    icon: <> </>
  })
  return pick(modal, 'destroy')
}

const transformProps = (props: ModalProps, modal: ModalRef) => {
  const { $t } = getIntl()
  switch (props.customContent?.action) {
    case 'DELETE':
      const { numOfEntities = 1, entityName, entityValue, confirmationText } = props.customContent

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
        {confirmationText && <ConfirmForm text={confirmationText} modal={modal} />}
      </>)
      props = {
        ...props, title, content,
        okText: $t(
          { defaultMessage: 'Delete {formattedEntityName}' },
          { formattedEntityName: entityName }
        ),
        okButtonProps: { disabled: Boolean(confirmationText) }
      }
      break
    case 'SHOW_ERRORS':
      const { errorDetails } = props.customContent
      props = {
        ...props,
        content: <ErrorTemplate content={props.content} errors={errorDetails} modal={modal} />,
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
  }
  return props
}

function ErrorTemplate (props: {
  content: React.ReactNode,
  errors: ErrorDetailsProps,
  modal: ModalRef
}) {
  const { $t } = getIntl()
  const okText = $t({ defaultMessage: 'OK' })
  return (
    <>
      <UI.Content>{props.content}</UI.Content>
      <UI.Footer>
        <CollapsePanel
          header={$t({ defaultMessage: 'Technical details' })}
          content={props.errors}
        />
        <UI.FooterButtons>
          <Button type='primary' onClick={() => props.modal.destroy()}>{okText}</Button>
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

function CollapsePanel (props: {
  header: string,
  content: ErrorDetailsProps
}) {
  const { $t } = getIntl()
  const inputEl = useRef<TextAreaRef>(null)
  const copyText = () => {
    navigator.clipboard.writeText(convertToJSON(props.content))
    inputEl.current?.resizableTextArea?.textArea.select()
  }
  return (
    <UI.Collapse
      ghost
      expandIconPosition='end'
      expandIcon={({ isActive }) => isActive ? <ExpandSquareUp /> : <ExpandSquareDown />}
    >
      <Panel header={props.header} key={props.header}>
        <TextArea ref={inputEl} rows={20} readOnly={true} value={convertToJSON(props.content)} />
        <UI.CopyButton
          type='link'
          onClick={copyText}
        >{$t({ defaultMessage: 'Copy to clipboard' })}</UI.CopyButton>
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
