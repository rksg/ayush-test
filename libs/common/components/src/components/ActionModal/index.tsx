import { useRef } from 'react'

import { Modal, Collapse, Form, Input } from 'antd'
import { TextAreaRef }                  from 'antd/lib/input/TextArea'
import { ModalFuncProps }               from 'antd/lib/modal'

import { ExpandSquareUp, ExpandSquareDown } from '@acx-ui/icons'

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

type CustomFootersContent = {
  action: 'CUSTOM_FOOTERS',
  errorDetails?: ErrorDetailsProps
  footers?: CustomButtonProps[]
}

export interface ModalProps extends ModalFuncProps {
  type: ModalType,
  customContent?: DeleteContent | CustomFootersContent
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
  handler: () => void;
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
        { confirmationText && <ConfirmForm text={confirmationText} modal={modal} /> }
      </>)
      props = {
        ...props,
        title: `Delete "${entityNameText}"?`,
        content: desp,
        okText: `Delete ${entityName}`,
        okButtonProps: { disabled: !!confirmationText }
      }
      break
    case 'CUSTOM_FOOTERS':
      props = {
        ...props,
        content: (<>
          <UI.Content>{props.content}</UI.Content>
          <CustomFooters
            errors={props.customContent?.errorDetails}
            footers={props.customContent?.footers}
            modal={modal}
          />
        </>),
        okText: ' ',
        className: 'modal-custom'
      }
      break
  }
  return props
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

function CustomFooters (props: {
  errors?: ErrorDetailsProps,
  footers?: CustomButtonProps[],
  modal: ModalRef
}) {

  const destroyModal = () => props.modal.destroy()

  const WithErrorDetails = () => {
    return (
      <>
        <CollapsePanel header='Technical details' content={props.errors} />
        <UI.FooterFixedButtons>
          <Button type='primary' onClick={destroyModal}>OK</Button>
        </UI.FooterFixedButtons>
      </>
    )
  }

  const WithButtons = () => {
    return (
      <UI.FooterButtons>{
        props.footers?.map((b: CustomButtonProps)=>{
          return (
            <Button
              type={b.type}
              key={b.key}
              onClick={() => b.key === 'cancel' ? destroyModal() : b.handler()}
            >
              {b.text}
            </Button>
          )
        })
      }</UI.FooterButtons>
    )
  }

  return (
    <UI.Footer>
      { props.errors ? <WithErrorDetails /> : <WithButtons /> }
    </UI.Footer>
  )
}