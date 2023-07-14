import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'

import { PasswordInput }                                                        from '@acx-ui/components'
import { formatter }                                                            from '@acx-ui/formatter'
import { EdgePasswordDetail, EdgeStatus, EdgeStatusEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                                                           from '@acx-ui/react-router-dom'
import { useUserProfileContext }                                                from '@acx-ui/user'

import * as UI from './styledComponents'

interface PropertiesProps {
  currentEdge: EdgeStatus | undefined,
  passwordDetail: EdgePasswordDetail | undefined
}

export const Properties = (props: PropertiesProps) => {

  const { currentEdge, passwordDetail } = props
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const isShowEdgePassword = userProfile?.support || userProfile?.var || userProfile?.dogfood

  return (
    <Form
      labelCol={{ span: 12 }}
      labelAlign='left'
      style={{ marginTop: currentEdge?.deviceStatus === EdgeStatusEnum.OPERATIONAL ? '25px' : 0 }}
    >
      <Form.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={
          <TenantLink to={`/venues/${currentEdge?.venueId}/venue-details/overview`}>
            {currentEdge?.venueName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Description' })}
        children={
          currentEdge?.description || $t({ defaultMessage: 'None' })
        }
      />
      {/* <Form.Item
        label={$t({ defaultMessage: 'Tags' })}
        children={
          currentEdge?.tags || '--'
        }
      /> */}

      <Divider/>

      <Form.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={
          transformDisplayText(currentEdge?.ip)
        }
      />

      <Divider/>

      <Form.Item
        label={$t({ defaultMessage: 'Model' })}
        children={
          currentEdge?.model || '###'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Type' })}
        children={
          transformDisplayText(currentEdge?.type)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'FW Version' })}
        children={
          transformDisplayText(currentEdge?.firmwareVersion)
        }
      />
      { isShowEdgePassword &&
      <>
        <Form.Item
          label={$t({ defaultMessage: 'Login Password' })}
          children={
            <UI.DetailsPassword>
              <PasswordInput
                readOnly
                bordered={false}
                value={passwordDetail?.loginPassword}
              />
            </UI.DetailsPassword>
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Enable Password' })}
          children={
            <UI.DetailsPassword>
              <PasswordInput
                readOnly
                bordered={false}
                value={passwordDetail?.enablePassword}
              />
            </UI.DetailsPassword>
          }
        />
      </>
      }
      <Form.Item
        label={$t({ defaultMessage: 'S/N' })}
        children={
          transformDisplayText(currentEdge?.serialNumber)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'CPU' })}
        children={
          (currentEdge?.cpuCores ? `${currentEdge?.cpuCores} vCPUs` : '--' )
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Memory' })}
        children={
          (currentEdge?.memoryTotal
            ? formatter('bytesFormat')(currentEdge?.memoryTotal)
            : '--')
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Storage' })}
        children={
          (currentEdge?.diskTotal
            ? formatter('bytesFormat')(currentEdge?.diskTotal)
            : '--')
        }
      />

    </Form>
  )
}