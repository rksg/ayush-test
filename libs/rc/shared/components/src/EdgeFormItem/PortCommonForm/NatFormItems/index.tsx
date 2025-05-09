import { useEffect, useMemo, useRef } from 'react'

import { Form, Row, Col, Switch, Input } from 'antd'
import { get, set }                      from 'lodash'
import { useIntl }                       from 'react-intl'

import { StepsFormLegacy }                                               from '@acx-ui/components'
import { Features }                                                      from '@acx-ui/feature-toggle'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeClusterStatus,
  EdgeLag, EdgeNatPool, EdgePort,
  natPoolSizeValidator, networkWifiIpRegExp, poolRangeOverlapValidator
} from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady }  from '../../../useEdgeActions'
import { StyledNoMarginFormItem } from '../styledComponents'
import { formFieldsPropsType }    from '../types'

export interface NatFormItemsProps {
  parentNamePath: string[],
  getFieldFullPath: (fieldName: string) => string[],
  formFieldsProps?: formFieldsPropsType
  clusterInfo: EdgeClusterStatus,
  portsData: EdgePort[],
  lagData: EdgeLag[] | undefined,
}
export const EdgeNatFormItems = (props: NatFormItemsProps) => {
  const { $t } = useIntl()
  const {
    parentNamePath, getFieldFullPath,
    formFieldsProps,
    clusterInfo,
    portsData, lagData
  } = props

  const isMultiNatIpEnabled = useIsEdgeFeatureReady(Features.EDGE_MULTI_NAT_IP_TOGGLE)
  const form = Form.useFormInstance()
  const lagId = form.getFieldValue(getFieldFullPath('id'))
  const physicalPortIfName = form.getFieldValue(getFieldFullPath('interfaceName'))

  // this reference is to store the validation state of startIp and endIp input field,
  // true is valid, false is invalid
  // eslint-disable-next-line max-len
  const rangeFieldsValidateStateRef = useRef<{ startIp: boolean, endIp: boolean }>({ startIp: false, endIp: false })
  const natEnabled = Form.useWatch(getFieldFullPath('natEnabled'), form)

  const allNatPoolsWithoutCurrent= useMemo(() => {
    if (!isMultiNatIpEnabled) return undefined

    return getAllNatPools(
      portsData.filter(port => port.id !== lagId && port.interfaceName !== physicalPortIfName),
      lagData?.filter(lag => lag.id !== lagId)
    )
  }, [portsData, lagData])

  const rangeFieldsValidator = async (fieldName: string, value: string) => {
    try {
      await networkWifiIpRegExp(value)
      set(rangeFieldsValidateStateRef.current, fieldName, true)
      return Promise.resolve()
    } catch (e) {
      set(rangeFieldsValidateStateRef.current, fieldName, false)
      return Promise.reject(e)
    }
  }

  useEffect(() => {
    const currentInterfacePools = form.getFieldValue(getFieldFullPath('natPools'))
    if (!natEnabled || !!currentInterfacePools?.length) return

    // need to have at least an empty nat pools data to display
    form.setFieldValue(getFieldFullPath('natPools'), [null])
  }, [natEnabled])

  return <><StepsFormLegacy.FieldLabel width='120px'>
    {$t({ defaultMessage: 'Use NAT Service' })}
    <Form.Item
      name={parentNamePath.concat('natEnabled')}
      valuePropName='checked'
      {...get(formFieldsProps, 'natEnabled')}
      children={<Switch />}
    />
  </StepsFormLegacy.FieldLabel>

  {
    // eslint-disable-next-line max-len
    isMultiNatIpEnabled && natEnabled && clusterInfo.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY &&
     <Form.Item
       label={$t({ defaultMessage: 'NAT IP Addresses Range' })}
     >
       <Form.List
         name={parentNamePath.concat('natPools')}
         rules={[{
           validator: async (_, value) => {
             try {
               const isValidInputs = rangeFieldsValidateStateRef.current.startIp
                                    && rangeFieldsValidateStateRef.current.endIp
               if (!isValidInputs) return Promise.resolve()

               const allNatPools = allNatPoolsWithoutCurrent!.concat(value)

               await natPoolSizeValidator(allNatPools)
               await poolRangeOverlapValidator(allNatPools)
               return Promise.resolve()
             } catch (e) {
               return Promise.reject(e)
             }
           }
         }]}
       >
         {(fields, _, { errors }) => {
           return <>
             {fields?.map(({ key, ...field }, index) =>
               <Row key={key} gutter={24}>
                 <Col span={12}>
                   <StyledNoMarginFormItem
                     {...field}
                     name={[index, 'startIpAddress']}
                     label={$t({ defaultMessage: 'Start' })}
                     rules={[{
                       validator: async (_, value) => rangeFieldsValidator('startIp', value)
                     }]}
                     {...get(formFieldsProps, 'natStartIp')}
                     children={<Input />}
                   />
                 </Col>
                 <Col span={12}>
                   <StyledNoMarginFormItem
                     {...field}
                     name={[index, 'endIpAddress']}
                     label={$t({ defaultMessage: 'End' })}
                     rules={[{
                       validator: async (_, value) => rangeFieldsValidator('endIp', value)
                     }]}
                     {...get(formFieldsProps, 'natEndIp')}
                     children={<Input />}
                   />
                 </Col>
               </Row>)}

             <Form.ErrorList errors={errors} />
           </>
         }}
       </Form.List>
     </Form.Item>
  }
  </>
}

const getAllNatPools = (portsData: EdgePort[], lagData: EdgeLag[] | undefined) => {
  const allPools = [] as EdgeNatPool[]

  const allNatPools = portsData.reduce((acc: EdgeNatPool[], port: EdgePort) => {
    const natPools = port.natPools?.map((natPool) => ({
      ...natPool
    }))
    return acc.concat(natPools)
  }, [])
  const allLagNatPools = (lagData ?? []).reduce((acc: EdgeNatPool[], lag: EdgeLag) => {
    const natPools = lag.natPools?.map((natPool) => ({
      ...natPool
    }))
    return acc.concat(natPools)
  }, [])

  // filter out initial component
  return allPools.concat(allNatPools, allLagNatPools)
    .filter(Boolean)
    .filter((item: EdgeNatPool) => {
      return item?.startIpAddress && item?.endIpAddress
    })
}