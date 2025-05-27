import { useEffect, useMemo, useState } from 'react'

import { Form, Row, Col, Switch, Input, Space } from 'antd'
import { get }                                  from 'lodash'
import { useIntl }                              from 'react-intl'

import { cssStr, StepsFormLegacy }                                       from '@acx-ui/components'
import { Features }                                                      from '@acx-ui/feature-toggle'
import {
  ClusterHighAvailabilityModeEnum,
  convertIpToLong,
  EdgeClusterStatus,
  EdgeLag, EdgeNatPool, EdgePort,
  IncompatibilityFeatures,
  natPoolSizeValidator, networkWifiIpRegExp, poolRangeOverlapValidator
} from '@acx-ui/rc/utils'

import { ApCompatibilityToolTip }                         from '../../../ApCompatibility/ApCompatibilityToolTip'
import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '../../../Compatibility/Edge/EdgeCompatibilityDrawer'
import { useIsEdgeFeatureReady }                          from '../../../useEdgeActions'
import { StyledNoMarginFormItem }                         from '../styledComponents'
import { formFieldsPropsType }                            from '../types'

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
  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()

  const lagId = form.getFieldValue(getFieldFullPath('id'))
  // eslint-disable-next-line max-len
  const lagMembers = (form.getFieldValue(getFieldFullPath('lagMembers')) ?? []) as EdgeLag['lagMembers']

  const physicalPortIfName = form.getFieldValue(getFieldFullPath('interfaceName'))
  const natEnabled = Form.useWatch(getFieldFullPath('natEnabled'), form)

  const allNatPoolsWithoutCurrent= useMemo(() => {
    if (!isMultiNatIpEnabled) return undefined

    return getAllNatPools(
      portsData.filter(port => port.id !== lagId && port.interfaceName !== physicalPortIfName
        && !lagMembers.some(m => m.portId === port.id)
      ),
      lagData?.filter(lag => lag.id !== lagId)
    )
  }, [portsData, lagData])

  const getStartIpAddressNamePath = (index: number) => {
    return getFieldFullPath('natPools').concat([index + '', 'startIpAddress'])
  }
  const getEndIpAddressNamePath = (index: number) => {
    return getFieldFullPath('natPools').concat([index + '', 'endIpAddress'])
  }

  const ipAddressValidator = async (index: number) => {
    // eslint-disable-next-line max-len
    const startIp = form.getFieldValue(getStartIpAddressNamePath(index))
    // eslint-disable-next-line max-len
    const endIp = form.getFieldValue(getEndIpAddressNamePath(index))

    if (!startIp && !endIp) {
      return Promise.resolve()
    }

    try {
      await networkWifiIpRegExp(startIp)
      await networkWifiIpRegExp(endIp)

      if ((endIp && !startIp) || (!endIp && startIp)) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'Invalid NAT pool start or end IP' }))
      }

      const startIpNUmber = convertIpToLong(startIp)
      const endIpNumber = convertIpToLong(endIp)
      if (startIpNUmber >= endIpNumber) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'Start IP cannot larger or equal to end IP' }))
      }

      return Promise.resolve()
    } catch(e) {
      return Promise.reject(e)
    }
  }

  const natPoolOverallValidator = async () => {
    try {
      const value = form.getFieldValue(getFieldFullPath('natPools'))
      // skip empty pool
      const poolsToValidate = value.filter((item: EdgeNatPool) => {
        return item?.startIpAddress && item?.endIpAddress
      })

      if (!poolsToValidate?.length) {
        return Promise.resolve()
      }

      const allNatPools = allNatPoolsWithoutCurrent!.concat(poolsToValidate)
      await natPoolSizeValidator(allNatPools)
      await poolRangeOverlapValidator(allNatPools)
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  useEffect(() => {
    const currentInterfacePools = form.getFieldValue(getFieldFullPath('natPools'))
    if (!natEnabled || !!currentInterfacePools?.length) return

    // need to have at least an empty nat pools data to display
    form.setFieldValue(getFieldFullPath('natPools'), [{ startIpAddress: '', endIpAddress: '' }])
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
       label={
         <Space size={3}>
           {$t({ defaultMessage: 'NAT IP Addresses Range' })}
           <ApCompatibilityToolTip
             title=''
             placement='bottom'
             showDetailButton
             // eslint-disable-next-line max-len
             onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.MULTI_NAT_IP)}
           />
         </Space>}
     >
       <Form.List name={parentNamePath.concat('natPools')}>
         {(fields) => {
           return <>
             <Row gutter={24}>
               <Col span={12}
                 style={{
                   fontSize: cssStr('--acx-body-4-font-size'),
                   color: cssStr('--acx-neutrals-60')
                 }}
               >
                 <span>{$t({ defaultMessage: 'Start' })}</span>
               </Col>
               <Col span={12}
                 style={{
                   fontSize: cssStr('--acx-body-4-font-size'),
                   color: cssStr('--acx-neutrals-60')
                 }}
               >
                 <span>{$t({ defaultMessage: 'End' })}</span>
               </Col>
             </Row>
             {fields?.map(({ key, ...field }, index) =>
               <Form.Item key={key}>
                 <Row gutter={24}>
                   <Col span={12}>
                     <StyledNoMarginFormItem
                       noStyle
                       {...field}
                       name={[index, 'startIpAddress']}
                       {...get(formFieldsProps, 'natStartIp')}
                       dependencies={[getEndIpAddressNamePath(index)]}
                       rules={[
                         { validator: async () => ipAddressValidator(index) },
                         { validator: async () => natPoolOverallValidator() }
                       ]}
                       validateFirst
                       children={<Input />}
                     />
                   </Col>
                   <Col span={12}>
                     <StyledNoMarginFormItem
                       noStyle
                       {...field}
                       name={[index, 'endIpAddress']}
                       {...get(formFieldsProps, 'natEndIp')}
                       dependencies={[getStartIpAddressNamePath(index)]}
                       children={<Input />}
                     />
                   </Col>
                 </Row>
               </Form.Item>
             )}
           </>
         }}
       </Form.List>

       <EdgeCompatibilityDrawer
         visible={!!edgeCompatibilityFeature}
         type={EdgeCompatibilityType.ALONE}
         title={$t({ defaultMessage: 'Compatibility Requirement' })}
         featureName={edgeCompatibilityFeature}
         onClose={() => setEdgeCompatibilityFeature(undefined)}
       />
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