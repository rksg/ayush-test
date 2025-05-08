import { useCallback, useLayoutEffect } from 'react'

import {
  Col,
  Form,
  Row } from 'antd'
import TextArea    from 'antd/lib/input/TextArea'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { EdgeClusterStatus, EdgeLag, EdgePortInfo } from '@acx-ui/rc/utils'

import { EdgePortCommonForm, EdgePortCommonFormProps } from '../PortCommonForm'

import * as UI from './styledComponents'

interface ConfigFormProps extends Pick<EdgePortCommonFormProps, 'formFieldsProps'> {
  formListItemKey: string
  id: string
  statusData?: EdgePortInfo
  isEdgeSdLanRun: boolean
  lagData?: EdgeLag[]
  fieldHeadPath: string[]
  isCluster?: boolean,
  clusterInfo: EdgeClusterStatus
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {
  const {
    id,
    statusData,
    formListItemKey,
    isEdgeSdLanRun,
    lagData,
    fieldHeadPath = [],
    isCluster,
    formFieldsProps,
    clusterInfo
  } = props

  const { $t } = useIntl()
  const form = useFormInstance()

  const getFieldPathBaseFormList = useCallback((fieldName: string) =>
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

  const forceUpdateCondition = (prev:unknown, cur: unknown) => {
    // eslint-disable-next-line max-len
    return _.get(prev, getFieldFullPath('corePortEnabled')) !== _.get(cur, getFieldFullPath('corePortEnabled'))
            // eslint-disable-next-line max-len
            || _.get(prev, getFieldFullPath('portType')) !== _.get(cur, getFieldFullPath('portType'))
            || _.get(prev, getFieldFullPath('enabled')) !== _.get(cur, getFieldFullPath('enabled'))
            || _.get(prev, getFieldFullPath('ipMode')) !== _.get(cur, getFieldFullPath('ipMode'))
  }

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
            name={getFieldPathBaseFormList('name')}
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 63 }
            ]}
            children={<TextArea disabled={isCluster} />}
          />
          <Form.Item
            noStyle
            shouldUpdate={forceUpdateCondition}
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
                formFieldsProps={formFieldsProps}
                clusterInfo={clusterInfo}
              />
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}