import { Modal, Button, Collapse, Form, Input } from 'antd'
import { ModalFuncProps }                       from 'antd/lib/modal'

import { ExpandSquareUp, ExpandSquareDown } from '@acx-ui/icons'

import * as UI from './styledComponents'
const { Panel } = Collapse

export type ModalType = 'info' | 'error' | 'confirm'

export interface ModalProps extends ModalFuncProps {
  type: ModalType,
  action?: 'DELETE' | 'SHOW_ERRORS',
  errorDetails?: ErrorDetailsProps,
  multiple?: boolean,
  numOfEntities?: number,
  entityName?: string,
  entityValue?: string,
  confirmationText?: string
}

export interface ModalRef {
  destroy: () => void;
  update: (configUpdate: ModalFuncProps) => void;
}

export interface ErrorDetailsProps {
  headers?: {
    normalizedNames: object,
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

export const showModal = (props: ModalProps) => {
  const modal = Modal[props.type]({})
  const config = transformProps(props, modal)
  modal.update({
    ...config,
    icon: <> </>
  })
}

const transformProps = (props: ModalProps, modal: ModalRef) => {
  const {
    action,
    content,
    errorDetails = {},
    multiple,
    numOfEntities,
    entityName,
    entityValue,
    confirmationText
  } = props

  switch (action) {
    case 'DELETE':
      const entityNameText = multiple ? `${numOfEntities} ${entityName}` : entityValue
      const desp = (<>
        {`Are you sure you want to delete ${numOfEntities ? 'these' : 'this'} ${entityName}?`}
        {confirmationText ? <ConfirmForm text={confirmationText} modal={modal} /> : null}
      </>)
      props = {
        ...props,
        title: `Delete "${entityNameText}"?`,
        content: desp,
        okText: `Delete ${props.entityName}`,
        okButtonProps: { disabled: !!confirmationText }
      }
      break
    case 'SHOW_ERRORS':
      const customContent = <CustomTemplate content={content} errors={errorDetails} modal={modal} />
      props = {
        ...props,
        content: customContent,
        className: 'modal-custom'
      }
      break
  }
  return props
}

function CustomTemplate (props: {
  content: React.ReactNode,
  errors: ErrorDetailsProps,
  modal: ModalRef
}) {
  return (
    <UI.CustomTemplate>
      <UI.Content>{props.content}</UI.Content>
      <UI.Footer>
        <CollapsePanel header='Technical details' content={props.errors} />
        <UI.FooterButtons>
          <Button type='primary' onClick={() => props.modal.destroy()}>OK</Button>
        </UI.FooterButtons>
      </UI.Footer>
    </UI.CustomTemplate>
  )
}

function CollapsePanel (props: {
  header: string,
  content: ErrorDetailsProps
}) {
  return (
    <UI.Collapse
      ghost
      expandIconPosition='end'
      expandIcon={({ isActive }) => isActive ? <ExpandSquareUp /> : <ExpandSquareDown />}
    >
      <Panel header={props.header} key={props.header}>
        <pre>{convertToJSON(props.content)}</pre>
        <UI.CopyButton
          type='link'
          onClick={() => {
            navigator.clipboard.writeText(convertToJSON(props.content))
          }}>Copy to clipboard</UI.CopyButton>
      </Panel>
    </UI.Collapse>
  )
}

function ConfirmForm (props: {
  text: string,
  modal: ModalRef
}) {
  return (
    <Form className='confirm-form'>
      <Form.Item
        name='name'
        label={`Type the word "${props.text}" to confirm:`}
      >
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
