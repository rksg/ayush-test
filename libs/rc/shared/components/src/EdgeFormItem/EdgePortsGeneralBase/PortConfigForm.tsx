import { useCallback, useLayoutEffect } from 'react'

import {
  Col,
  Form,
  Row } from 'antd'
import TextArea    from 'antd/lib/input/TextArea'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { EdgeLag, EdgePortInfo } from '@acx-ui/rc/utils'

import { EdgePortCommonForm } from '../PortCommonForm'

import * as UI from './styledComponents'

interface ConfigFormProps {
  formListItemKey: string
  id: string
  statusData?: EdgePortInfo
  isEdgeSdLanRun: boolean
  lagData?: EdgeLag[]
  fieldHeadPath: string[]
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {
  const {
    id,
    statusData,
    formListItemKey,
    isEdgeSdLanRun,
    lagData,
    fieldHeadPath = []
  } = props

  const { $t } = useIntl()
  const form = useFormInstance()

  const getFieldPath = useCallback((fieldName: string) =>
    [formListItemKey, fieldName],
  [formListItemKey])

  const getFieldFullPath = useCallback((fieldName: string) =>
    fieldHeadPath.concat([fieldName]),
  [fieldHeadPath])

  useWatch(getFieldFullPath('id'), form)
  const statusIp = statusData?.ip
  const mac = statusData?.mac

  useLayoutEffect(() => {
    form.validateFields()
  }, [id, form])

  const portsDataRootPath = fieldHeadPath.length
    ? fieldHeadPath.slice(0, fieldHeadPath.length - 2)
    : []

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
              const allPortsValues = portsDataRootPath.length
                ? _.get(form.getFieldsValue(true), portsDataRootPath)
                : form.getFieldsValue(true)

              return <EdgePortCommonForm
                formRef={form}
                portsData={_.flatten(Object.values(allPortsValues))}
                lagData={lagData}
                isEdgeSdLanRun={isEdgeSdLanRun}
                formListItemKey={formListItemKey}
                fieldHeadPath={fieldHeadPath}
                portsDataRootPath={portsDataRootPath}
                formListID={id}
              />
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}