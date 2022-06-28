import { Form, Input } from 'antd'
import { get }         from 'lodash'

import { NetworkSaveData } from '@acx-ui/rc/utils'

export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  return (
    <>
      {
        get(summaryData, 'authRadius.primary.ip') !== undefined && <>Authentication Service
          <Form.Item
            label='Primary Server:'
            children={get(summaryData, 'authRadius.primary.ip') !== '' ? 
              get(summaryData, 'authRadius.primary.ip') + ':' + 
              get(summaryData, 'authRadius.primary.port') : ''} />
          <Form.Item
            label='Shared Secret:'
            children={<Input.Password
              readOnly
              bordered={false}
              value={get(props.summaryData, 'authRadius.primary.sharedSecret') !== '' ?
                get(props.summaryData, 'authRadius.primary.sharedSecret') : ''}
            />}
          />
          {
            get(summaryData, 'authRadius.secondary.ip') !== undefined && 
            <>
              <Form.Item
                label='Secondary Server:'
                children={get(summaryData, 'authRadius.secondary.ip') !== '' ? 
                  get(summaryData, 'authRadius.secondary.ip') + ':' + 
                  get(summaryData, 'authRadius.secondary.port') : ''} />
              <Form.Item
                label='Shared Secret:'
                children={<Input.Password
                  readOnly
                  bordered={false}
                  value={get(props.summaryData, 'authRadius.secondary.sharedSecret') !== '' ?
                    get(props.summaryData, 'authRadius.secondary.sharedSecret') : ''}
                />}
              />
            </>
          }
          <Form.Item
            label='Proxy Service:'
            children={summaryData.enableAuthProxy ? 'Enabled' : 'Disabled'} />
          <Form.Item
            label='TLS Encryption:'
            children='Disabled' />
        </>
      }
      {
        summaryData.enableAccountingService && <>Accounting Service
          <Form.Item
            label='Primary Server:'
            children={get(summaryData, 'accountingRadius.primary.ip') !== '' ? 
              get(summaryData, 'accountingRadius.primary.ip') + ':' + 
              get(summaryData, 'accountingRadius.primary.port') : ''} />
          <Form.Item
            label='Shared Secret:'
            children={<Input.Password
              readOnly
              bordered={false}
              value={get(props.summaryData, 'accountingRadius.primary.sharedSecret') !== '' ?
                get(props.summaryData, 'accountingRadius.primary.sharedSecret') : ''}
            />}
          />

          {
            get(summaryData, 'authRadius.secondary.ip') !== undefined && 
            <>
              <Form.Item
                label='Secondary Server:'
                children={get(summaryData, 'accountingRadius.secondary.ip') !== '' ? 
                  get(summaryData, 'accountingRadius.secondary.ip') + ':' + 
                  get(summaryData, 'accountingRadius.secondary.port') : ''} />
              <Form.Item
                label='Shared Secret:'
                children={<Input.Password
                  readOnly
                  bordered={false}
                  value={get(props.summaryData, 'accountingRadius.secondary.sharedSecret') !== ''
                    ? get(props.summaryData, 'accountingRadius.secondary.sharedSecret') : ''}
                />}
              />
            </>
          }
          <Form.Item
            label='Accounting Proxy Service:'
            children={summaryData.enableAccountingProxy ? 'Enabled' : 'Disabled'} />
          <Form.Item
            label='TLS Encryption:'
            children='Disabled' />
        </>
      }
    </>

  )
}
