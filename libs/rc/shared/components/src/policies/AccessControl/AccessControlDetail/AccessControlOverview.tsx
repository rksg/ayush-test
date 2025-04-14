
import React from 'react'

import { useIntl } from 'react-intl'

import { Button, SummaryCard }                                      from '@acx-ui/components'
import { EnabledStatus, EnhancedAccessControlInfoType, PolicyType } from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier }                               from '@acx-ui/user'

import {
  ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
  AccessControlSubPolicyDrawers,
  useAccessControlSubPolicyVisible
} from '../AccessControlPolicy'

interface SubPolicyDetailProps {
  policyType: PolicyType,
  policyId: string
}

// eslint-disable-next-line max-len
export default function AccessControlOverview (props: { data: EnhancedAccessControlInfoType | undefined }) {
  const { $t } = useIntl()
  const { data } = props
  const { accountTier } = getUserProfile()
  // eslint-disable-next-line max-len
  const [ accessControlSubPolicyVisible, setAccessControlSubPolicyVisible ] = useAccessControlSubPolicyVisible()
  const isCore = isCoreTier(accountTier)

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
      content: data && data.l2AclPolicyId
        ? <SubPolicyDetail
          policyType={PolicyType.LAYER_2_POLICY}
          policyId={data.l2AclPolicyId}
        />
        : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Layer 3' }),
      content: data && data.l3AclPolicyId
        ? <SubPolicyDetail
          policyType={PolicyType.LAYER_3_POLICY}
          policyId={data.l3AclPolicyId}
        />
        : EnabledStatus.OFF
    },
    {
      title: $t({ defaultMessage: 'Device & OS' }),
      content: data && data.devicePolicyId
        ? <SubPolicyDetail
          policyType={PolicyType.DEVICE_POLICY}
          policyId={data.devicePolicyId}
        />
        : EnabledStatus.OFF
    },
    ...((isCore) ? [] : [{
      title: $t({ defaultMessage: 'Applications' }),
      content: data && data.applicationPolicyId
        ? <SubPolicyDetail
          policyType={PolicyType.APPLICATION_POLICY}
          policyId={data.applicationPolicyId}
        />
        : EnabledStatus.OFF
    }]),
    {
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      content: data && (data.clientRateUpLinkLimit || data.clientRateDownLinkLimit)
        ? EnabledStatus.ON
        : EnabledStatus.OFF
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
