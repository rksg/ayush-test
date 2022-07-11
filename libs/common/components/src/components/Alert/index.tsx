import { AlertProps, Row } from 'antd'

import { InformationSolid } from '@acx-ui/icons'

import { AlertStyle } from './styledComponents'

export const Alert = (props: AlertProps) => {
  const alertProps = { ...props }
  if (props.type === 'info') {
    alertProps.message = <Row>
      <div className='anticon ant-alert-icon'>
        <InformationSolid />
      </div>
      <span>
        {props.message}
      </span>
    </Row>
  }
  return (<AlertStyle {...alertProps} />)
}