
import { ReactNode, useCallback, useEffect } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'

import { StepsForm }                                                                     from '@acx-ui/components'
import { useLazyGetEdgeListQuery }                                                       from '@acx-ui/rc/services'
import { EdgeFirewallSetting }                                                           from '@acx-ui/rc/utils'
import { ACLDirection, getServiceRoutePath, ServiceOperation, ServiceType, StatefulAcl } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                 from '@acx-ui/react-router-dom'

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
    })
  })
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

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={onFinish}
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

