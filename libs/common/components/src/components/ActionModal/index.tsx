import { useRef } from 'react'

import { Modal, Collapse, Form, Input } from 'antd'
import { TextAreaRef }                  from 'antd/lib/input/TextArea'
import { ModalFuncProps }               from 'antd/lib/modal'

import { ExpandSquareUp, ExpandSquareDown } from '@acx-ui/icons'

import { Button } from '../Button'

import * as UI from './styledComponents'

const { Panel } = Collapse
const { TextArea } = Input

export type ModalType = 'info' | 'error' | 'confirm'

type DeleteContent = {
  action: 'DELETE',
  entityName: string,
  entityValue: string,
  numOfEntities?: number,
  confirmationText?: string
}

type ErrorContent = {
  action: 'SHOW_ERRORS',
  errorDetails: ErrorDetailsProps
}

export interface ModalProps extends ModalFuncProps {
  type: ModalType,
  customContent?: DeleteContent | ErrorContent
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
}

const transformProps = (props: ModalProps, modal: ModalRef) => {
  switch (props.customContent?.action) {
    case 'DELETE':
      const { numOfEntities, entityName, entityValue, confirmationText } = props.customContent
      const entityNameText = numOfEntities ? `${numOfEntities} ${entityName}` : entityValue
      const desp = (<>
        {`Are you sure you want to delete ${numOfEntities ? 'these' : 'this'} ${entityName}?`}
        {confirmationText ? <ConfirmForm text={confirmationText} modal={modal} /> : null}
      </>)
      props = {
        ...props,
        title: `Delete "${entityNameText}"?`,
        content: desp,
        okText: `Delete ${entityName}`,
        okButtonProps: { disabled: !!confirmationText }
      }
      break
    case 'SHOW_ERRORS':
      const customContent = <ErrorTemplate
        content={props.content}
        errors={props.customContent.errorDetails}
        modal={modal} />
      props = {
        ...props,
        content: customContent,
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
  return (
    <>
      <UI.Content>{props.content}</UI.Content>
      <UI.Footer>
        <CollapsePanel header='Technical details' content={props.errors} />
        <UI.FooterButtons>
          <Button type='primary' onClick={() => props.modal.destroy()}>OK</Button>
        </UI.FooterButtons>
      </UI.Footer>
    </>
  )
}

function CollapsePanel (props: {
  header: string,
  content: ErrorDetailsProps
}) {
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
        <UI.CopyButton type='link' onClick={copyText}>
          Copy to clipboard
        </UI.CopyButton>
      </Panel>
    </UI.Collapse>
  )
}

function ConfirmForm (props: {
  text: string,
  modal: ModalRef
}) {
  return (
    <Form>
      <Form.Item name='name' label={`Type the word "${props.text}" to confirm:`}>
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
