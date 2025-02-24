import { ReactElement } from 'react'

import { Form } from 'antd'

import { cssStr } from '@acx-ui/components'

import * as UI from '../../styledComponents'

export const RedAlertMessage = (props: { children: ReactElement }) => {
  return <Form.Item style={{ marginBottom: '0' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      paddingLeft: '24px',
      width: '600px',
      color: cssStr('--acx-semantics-red-70')
    }} >
      <div style={{ height: '100%', gridRow: 1, gridColumn: 1 }}>
        <UI.WarningTriangleSolid/>
      </div>
      <div style={{ fontSize: '12px', paddingLeft: '3px', gridRow: 1, gridColumn: 2 }}>
        {props.children}
      </div>
    </div>
  </Form.Item>
}
