import { useEffect, useMemo, useState } from 'react'

import { Form, Row, Col, Switch, Input, Space, FormItemProps } from 'antd'
import { get, omit }                                           from 'lodash'
import { useIntl }                                             from 'react-intl'

import { cssStr, StepsFormLegacy } from '@acx-ui/components'
import { Features }                from '@acx-ui/feature-toggle'
import {
  ClusterHighAvailabilityModeEnum,
  convertIpToLong,
  EdgeClusterStatus,
  EdgeLag, EdgeNatPool, EdgePort,
  getEdgeNatPools,
  IncompatibilityFeatures,
  natPoolSizeValidator, networkWifiIpRegExp, poolRangeOverlapValidator,
  EdgeFormFieldsPropsType
} from '@acx-ui/rc/utils'

import { ApCompatibilityToolTip }                         from '../../../ApCompatibility/ApCompatibilityToolTip'
import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '../../../Compatibility/Edge/EdgeCompatibilityDrawer'
import { useIsEdgeFeatureReady }                          from '../../../useEdgeActions'
import { StyledNoMarginFormItem }                         from '../styledComponents'

export interface NatFormItemsProps {
  parentNamePath: string[],
  getFieldFullPath: (fieldName: string) => string[],
  formFieldsProps?: EdgeFormFieldsPropsType
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

    return getEdgeNatPools(
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
      if (startIpNUmber > endIpNumber) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'Start IP cannot be greater than end IP' }))
      }

      return Promise.resolve()
    } catch(e) {
      return Promise.reject(e)
    }
  }

  const natPoolNodeLevelValidator = async () => {
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
                       {...omit(get(formFieldsProps, 'natStartIp'), 'rules')}
                       dependencies={[getEndIpAddressNamePath(index)]}
                       rules={[
                         { validator: async () => ipAddressValidator(index) },
                         { validator: async () => natPoolNodeLevelValidator() },
                         // eslint-disable-next-line max-len
                         ...(get(formFieldsProps, 'natStartIp.rules') as FormItemProps['rules'] ?? [])
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