import { Form, Row, Col, Switch, Input } from 'antd'
import { get }                           from 'lodash'
import { useIntl }                       from 'react-intl'

import { StepsFormLegacy }                                               from '@acx-ui/components'
import { Features }                                                      from '@acx-ui/feature-toggle'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeLag, EdgeNatPool, EdgePort,
  natPoolSizeValidator, networkWifiIpRegExp, poolRangeOverlapValidator
} from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../../../useEdgeActions'
import { formFieldsPropsType }   from '../types'

interface NatFormItemsProps {
  parentNamePath: string[],
  getFieldFullPath: (fieldName: string) => string[],
  formFieldsProps?: formFieldsPropsType
  clusterMode: ClusterHighAvailabilityModeEnum | undefined,
  portsData: EdgePort[],
  lagData: EdgeLag[] | undefined,
}
export const EdgeNatFormItems = (props: NatFormItemsProps) => {
  const { $t } = useIntl()
  const {
    parentNamePath, getFieldFullPath,
    formFieldsProps,
    clusterMode,
    portsData, lagData
  } = props

  const isMultiNatIpEnabled = useIsEdgeFeatureReady(Features.EDGE_MULTI_NAT_IP_TOGGLE)

  // TODO: validations for multi NAT IP
  //ok - Multi NAT IP only support AB mode cluster
  // - cannot overlap between pool ranges in a cluster node
  // - total range cannot exceed 128 per node : MAX_NAT_POOL_TOTAL_SIZE

  const getAllNatPools = () => {
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
    return allPools.concat(allNatPools, allLagNatPools).filter(Boolean)
  }
  const allNatPools = getAllNatPools()

  return <><StepsFormLegacy.FieldLabel width='120px'>
    {$t({ defaultMessage: 'Use NAT Service' })}
    <Form.Item
      name={parentNamePath.concat('natEnabled')}
      valuePropName='checked'
      {...get(formFieldsProps, 'natEnabled')}
      children={<Switch />}
    />
  </StepsFormLegacy.FieldLabel>
  {isMultiNatIpEnabled && /*clusterMode === ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY &&*/
     <Form.Item
       dependencies={[parentNamePath.concat('natEnabled')]}
     >
       {({ getFieldValue }) => {
         const natEnabled = getFieldValue(getFieldFullPath('natEnabled'))
         if (!natEnabled) {
           return null
         }

         return <Form.Item
           label={$t({ defaultMessage: 'NAT IP Addresses Range' })}
         >
           <Form.List
             name={parentNamePath.concat('natPools')}
             rules={[{
               validator: () => {
                 //cannot overlap between pool ranges in a cluster node
                 const allPools = allNatPools?.filter((item: EdgeNatPool) => {
                   return item?.startIpAddress && item?.endIpAddress
                 })

                 return poolRangeOverlapValidator(allPools)
               }
             }, {
               validator: () => {
                 //cannot overlap between pool ranges in a cluster node
                 const allPools = allNatPools?.filter((item: EdgeNatPool) => {
                   return item?.startIpAddress && item?.endIpAddress
                 })

                 return natPoolSizeValidator(allPools)
               }
             }]}
           >
             {(fields, { add }) => {
               if (fields.length === 0) {
                 add()
                 return
               }

               return fields?.map((field, index) =>
                 <Row gutter={8}>
                   <Col span={12}>
                     <Form.Item
                       {...field}
                       label={$t({ defaultMessage: 'Start' })}
                       name={[index, 'startIpAddress']}
                       rules={[{
                         validator: (_, value) => networkWifiIpRegExp(value)
                       }]}
                       {...get(formFieldsProps, 'natStartIp')}
                       children={<Input />}
                     />
                   </Col>
                   <Col span={12}>
                     <Form.Item
                       {...field}
                       label={$t({ defaultMessage: 'End' })}
                       name={[index, 'endIpAddress']}
                       rules={[{
                         validator: (_, value) => networkWifiIpRegExp(value)
                       }]}
                       {...get(formFieldsProps, 'natEndIp')}
                       children={<Input />}
                     />
                   </Col>
                 </Row>
               )
             }}
           </Form.List>
         </Form.Item>
       }}
     </Form.Item>
  }
  </>
}