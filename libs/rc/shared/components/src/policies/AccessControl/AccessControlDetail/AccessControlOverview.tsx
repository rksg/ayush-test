
import React from 'react'

import { useIntl } from 'react-intl'

import { Button, SummaryCard }                              from '@acx-ui/components'
import { AccessControlInfoType, EnabledStatus, PolicyType } from '@acx-ui/rc/utils'

import {
  ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
  AccessControlSubPolicyDrawers,
  useAccessControlSubPolicyVisible
} from '../AccessControlPolicy'

interface SubPolicyDetailProps {
  policyType: PolicyType,
  policyId: string
}

export default function AccessControlOverview (props: { data: AccessControlInfoType | undefined }) {
  const { $t } = useIntl()
  const { data } = props
  // eslint-disable-next-line max-len
  const [ accessControlSubPolicyVisible, setAccessControlSubPolicyVisible ] = useAccessControlSubPolicyVisible()

  const SubPolicyDetail = ({ policyType, policyId } : SubPolicyDetailProps ) => {
    return <Button
      type='link'
      size={'small'}
      onClick={() => {
        setAccessControlSubPolicyVisible({
          ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
          [policyType]: {
            id: policyId,
            visible: true,
            drawerViewMode: true
          }
        })
      }}>
      {EnabledStatus.ON}
    </Button>
  }

  const accessControlInfo = [
    {
      title: $t({ defaultMessage: 'Layer 2' }),
      content: data && data.l2AclPolicy?.enabled
        ? <SubPolicyDetail
          policyType={PolicyType.LAYER_3_POLICY}
          policyId={data.l2AclPolicy.id}
        />
        : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Layer 3' }),
      content: data && data.l3AclPolicy?.enabled
        ? <SubPolicyDetail
          policyType={PolicyType.LAYER_3_POLICY}
          policyId={data.l3AclPolicy.id}
        />
        : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Device & OS' }),
      content: data && data.devicePolicy?.enabled
        ? <SubPolicyDetail
          policyType={PolicyType.DEVICE_POLICY}
          policyId={data.devicePolicy.id}
        />
        : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Applications' }),
      content: data && data.applicationPolicy?.enabled
        ? <SubPolicyDetail
          policyType={PolicyType.APPLICATION_POLICY}
          policyId={data.applicationPolicy.id}
        />
        : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      content: data && data.rateLimiting?.enabled ? EnabledStatus.ON : EnabledStatus.OFF
    }
  ]

  return <>
    <SummaryCard data={accessControlInfo} />
    <AccessControlSubPolicyDrawers
      accessControlSubPolicyVisible={accessControlSubPolicyVisible}
      setAccessControlSubPolicyVisible={setAccessControlSubPolicyVisible}
    />
  </>
}
