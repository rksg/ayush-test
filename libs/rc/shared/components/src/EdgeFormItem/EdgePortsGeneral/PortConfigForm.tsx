import { useCallback, useLayoutEffect } from 'react'

import {
  Col,
  Form,
  Row } from 'antd'
import TextArea    from 'antd/lib/input/TextArea'
import _           from 'lodash'
import { useIntl } from 'react-intl'


import { EdgeLag } from '@acx-ui/rc/utils'

import { EdgePortCommonForm } from '../PortCommonForm'

import * as UI                from './styledComponents'
import { getInnerPortFormID } from './utils'

import { EdgePortConfigFormType } from '.'

interface ConfigFormProps {
  formListKey: number
  id: string
  isEdgeSdLanRun: boolean
  lagData?: EdgeLag[]
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {
  const { id, formListKey, isEdgeSdLanRun, lagData } = props
  const { $t } = useIntl()
  const form = useFormInstance<EdgePortConfigFormType>()

  const getFieldPath = useCallback((fieldName: string) =>
    [formListKey, fieldName],
  [formListKey])

  const getFieldFullPath = useCallback((fieldName: string) =>
    [getInnerPortFormID(id), ...getFieldPath(fieldName)],
  [id, getFieldPath])

  const statusIp = useWatch(getFieldFullPath('statusIp'), form)
  const mac = useWatch(getFieldFullPath('mac'), form)

  useLayoutEffect(() => {
    form.validateFields()
  }, [mac, form])


  return (
    <>
      <UI.IpAndMac>
        {
          $t(
            { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
            { ip: statusIp || 'N/A', mac: mac }
          )
        }
      </UI.IpAndMac>
      <Row gutter={20}>
        <Col span={6}>
          <Form.Item
            name={getFieldPath('name')}
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 63 }
            ]}
            children={<TextArea />}
          />
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => {
              return _.get(prev, getFieldFullPath('corePortEnabled'))
                !== _.get(cur, getFieldFullPath('corePortEnabled'))
            }}
          >
            {() => {
              const allValues = form.getFieldsValue(true) as EdgePortConfigFormType

              return <EdgePortCommonForm
                formRef={form}
                portsData={_.flatten(Object.values(allValues))}
                lagData={lagData}
                isEdgeSdLanRun={isEdgeSdLanRun}
                formListItemKey={formListKey}
                formListID={id}
              />
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
