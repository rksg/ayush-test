import { ModalProps }                from '../Modal'
import { StepsForm, StepsFormProps } from '../StepsForm'

import { Modal } from './styledComponents'

interface ModalStepsFormProps extends StepsFormProps, Omit<ModalProps, 'onCancel'> {}

export const ModalStepsForm : React.FC<ModalStepsFormProps> = ({
  children, ...props
}) => {
  return <Modal
    {...props}
    closable={false}
    width={props.width || '95%'}
    footer={<div style={{ display: 'none' }} />}
  >
    <StepsForm {...props} modalMode={true} >
      {children}
    </StepsForm>
  </Modal>
}
