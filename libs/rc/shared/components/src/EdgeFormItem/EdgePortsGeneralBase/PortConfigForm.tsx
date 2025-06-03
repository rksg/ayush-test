import { useCallback, useLayoutEffect, useMemo } from 'react'

import {
  Col,
  Form,
  Row } from 'antd'
import TextArea    from 'antd/lib/input/TextArea'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { EdgeClusterStatus, EdgeIpModeEnum, EdgeLag, EdgePort, EdgePortInfo, SubInterface } from '@acx-ui/rc/utils'

import { EdgePortCommonForm, EdgePortCommonFormProps } from '../PortCommonForm'

import * as UI from './styledComponents'

interface ConfigFormProps extends Pick<EdgePortCommonFormProps, 'formFieldsProps'> {
  formListItemKey: string
  id: string
  statusData?: EdgePortInfo
  isEdgeSdLanRun: boolean
  lagData?: EdgeLag[]
  fieldHeadPath: string[]
  disabled?: boolean,
  clusterInfo: EdgeClusterStatus
  subInterfaceList?: SubInterface[]
  isSupportAccessPort?: boolean
}

const { useWatch, useFormInstance } = Form

export const PortConfigForm = (props: ConfigFormProps) => {
  const {
    id,
    statusData,
    formListItemKey,
    isEdgeSdLanRun,
    lagData = [],
    fieldHeadPath = [],
    disabled,
    formFieldsProps,
    subInterfaceList = [],
    clusterInfo,
    isSupportAccessPort
  } = props

  const { $t } = useIntl()
  const form = useFormInstance()

  const subnetInfoForValidation = useMemo(() => {
    return [
      // eslint-disable-next-line max-len
      ...lagData.filter(lag => lag.lagEnabled && Boolean(lag.ip) && Boolean(lag.subnet) && lag.ipMode === EdgeIpModeEnum.STATIC)
        .map(lag => ({ id: lag.id, ip: lag.ip!, subnetMask: lag.subnet! })),
      // eslint-disable-next-line max-len
      ...subInterfaceList.filter(subInterface => Boolean(subInterface.ip) && Boolean(subInterface.subnet) && subInterface.ipMode === EdgeIpModeEnum.STATIC)
        .map(subInterface => ({
          id: subInterface.id ?? '',
          ip: subInterface.ip!,
          subnetMask: subInterface.subnet!
        }))
    ]
  }, [lagData, subInterfaceList])

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
        <Col span={8}>
          <Form.Item
            name={getFieldPathBaseFormList('name')}
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 63 }
            ]}
            children={<TextArea disabled={disabled} />}
          />
          <Form.Item
            noStyle
            shouldUpdate={forceUpdateCondition}
          >
            {() => {
              const allPortsValues = portsDataRootPath.length
                ? _.get(form.getFieldsValue(true), portsDataRootPath)
                : form.getFieldsValue(true)

              const portsData = _.flatten(Object.values(allPortsValues)) as EdgePort[]
              // eslint-disable-next-line max-len
              const portsToBeValidated = portsData.filter(port => port.enabled && Boolean(port.ip) && Boolean(port.subnet) && port.ipMode === EdgeIpModeEnum.STATIC)
                .map(port => ({ id: port.id, ip: port.ip, subnetMask: port.subnet }))

              return <EdgePortCommonForm
                formRef={form}
                portsData={portsData}
                lagData={lagData}
                isEdgeSdLanRun={isEdgeSdLanRun}
                formListItemKey={formListItemKey}
                fieldHeadPath={fieldHeadPath}
                portsDataRootPath={portsDataRootPath}
                formFieldsProps={formFieldsProps}
                subnetInfoForValidation={subnetInfoForValidation.concat(portsToBeValidated)}
                clusterInfo={clusterInfo}
                subInterfaceList={subInterfaceList}
                isSupportAccessPort={isSupportAccessPort}
              />
            }}
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}