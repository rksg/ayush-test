
import { ReactNode, useCallback, useEffect } from 'react'

import { Form } from 'antd'
import _        from 'lodash'


import { StepsForm }                                               from '@acx-ui/components'
import { useLazyGetEdgeListQuery }                                 from '@acx-ui/rc/services'
import { EdgeFirewallSetting }                                     from '@acx-ui/rc/utils'
import { getServiceRoutePath, ServiceOperation, ServiceType }      from '@acx-ui/rc/utils'
import { ACLDirection, AddressType, StatefulAcl, StatefulAclRule } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                   from '@acx-ui/react-router-dom'

import { defaultStatefulACLs } from './SettingsForm/StatefulACLFormItem'

export interface FirewallFormEdge {
  serialNumber: string;
  name: string;
}
export interface FirewallFormModel extends EdgeFirewallSetting {
  selectedEdges: FirewallFormEdge[]
}

export const filterCustomACLRules = (acls: StatefulAcl[]) => {
  const result = _.cloneDeep(acls)
  result.forEach(acl => {
    if (acl.direction === ACLDirection.OUTBOUND) {
      // the 1-3 rules are default rules
      _.remove(acl.rules, (o) => Number(o?.priority) <= 3)
    }

    // one of the default rule is always the last rule
    acl.rules.pop()
  })

  return result
}

export const processFirewallACLPayload = (acls: StatefulAcl[]) => {
  acls.forEach(acl => {
    // priority cannot in payload
    acl.rules.forEach((rule) => {
      delete rule.priority
      processAddressValues(rule)
    })
  })
}

const processAddressValues = (rule: StatefulAclRule) => {
  switch (rule.sourceAddressType) {
    case AddressType.ANY_IP_ADDRESS:
      rule.sourceAddress = ''
      rule.sourceAddressMask = ''
      break
    case AddressType.SUBNET_ADDRESS:
      break
    case AddressType.IP_ADDRESS:
      rule.sourceAddressMask = ''
      break
  }

  switch (rule.destinationAddressType) {
    case AddressType.ANY_IP_ADDRESS:
      rule.destinationAddress = ''
      rule.destinationAddressMask = ''
      break
    case AddressType.SUBNET_ADDRESS:
      break
    case AddressType.IP_ADDRESS:
      rule.destinationAddressMask = ''
      break
  }
}

interface FirewallFormStep {
  title: string
  content: ReactNode
}

interface FirewallFormProps {
  steps: FirewallFormStep[]
  editMode?: boolean
  editData?: EdgeFirewallSetting
  onFinish: (values: FirewallFormModel) => Promise<boolean | void>
}

const addDefaultACL = (data:EdgeFirewallSetting) => {
  let editData = _.cloneDeep(data)
  editData.statefulAcls = _.cloneDeep(defaultStatefulACLs) as StatefulAcl[]

  const inboundIdx = _.findIndex(data.statefulAcls,
    { direction: ACLDirection.INBOUND })
  const outboundIdx = _.findIndex(data.statefulAcls,
    { direction: ACLDirection.OUTBOUND })

  if (inboundIdx !== -1) {
    const inIdx = _.findIndex(editData.statefulAcls,
      { direction: ACLDirection.INBOUND })
    editData.statefulAcls[inIdx] = {
      ...data.statefulAcls[inboundIdx]
    } as StatefulAcl
  }

  if (outboundIdx !== -1) {
    const outIdx = _.findIndex(editData.statefulAcls,
      { direction: ACLDirection.OUTBOUND })
    editData.statefulAcls[outIdx] = {
      ...data.statefulAcls[outboundIdx]
    } as StatefulAcl
  }

  return editData
}

const FirewallForm = (props: FirewallFormProps) => {
  const { steps, editMode, editData, onFinish } = props
  const navigate = useNavigate()
  const params = useParams()
  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_FIREWALL,
    oper: ServiceOperation.LIST
  }))
  const [form] = Form.useForm()
  const [getEdgeList] = useLazyGetEdgeListQuery()

  const fetchEdgesByIds = useCallback(
    async (edgeIds: string[] | undefined, cb: (edges: FirewallFormEdge[]) => void) => {
      if (!edgeIds || edgeIds.length === 0) return

      try {
        const edgeOptionsDefaultPayload = {
          fields: ['name', 'serialNumber'],
          sortField: 'name',
          filters: { serialNumber: edgeIds },
          sortOrder: 'ASC'
        }

        const { data } = await getEdgeList(
          { params, payload: edgeOptionsDefaultPayload }
        ).unwrap()

        cb(data.map(item =>
          ({ name: item.name, serialNumber: item.serialNumber })))
      } catch {
        cb([] as FirewallFormEdge[])
      }
    }, [params, getEdgeList])



  useEffect(() => {
    if(form && editData) {
      form.resetFields()
      fetchEdgesByIds(editData.edgeIds, (edges: FirewallFormEdge[]) => {
        form.setFieldValue('selectedEdges', edges)
      })
      const edData = addDefaultACL(editData)
      form.setFieldsValue(edData)
    }
  }, [form, editData])

  const handleFinish = async (formData: FirewallFormModel) => {
    const data = _.cloneDeep(formData)
    const statefulAcls = (formData.statefulAclEnabled || editMode) ? formData.statefulAcls : []
    data.statefulAcls = filterCustomACLRules(statefulAcls)
    processFirewallACLPayload(data.statefulAcls)
    onFinish(data)
  }

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={handleFinish}
    editMode={editMode}
  >
    {
      steps.map((item, index) =>
        <StepsForm.StepForm
          key={`step-${index}`}
          name={index.toString()}
          title={item.title}
        >
          {item.content}
        </StepsForm.StepForm>)
    }
  </StepsForm>
  )
}

export default FirewallForm

