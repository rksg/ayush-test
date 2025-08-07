import {  Col, Form, Row } from 'antd'
import { useIntl }         from 'react-intl'

import { Drawer, Loader, PasswordInput, Subtitle }          from '@acx-ui/components'
import { useGetIpsecViewDataListQuery }                     from '@acx-ui/rc/services'
import { IpsecViewData, IpSecAuthEnum, defaultIpsecFields } from '@acx-ui/rc/utils'

interface IpsecDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  ipsecId: string | undefined
}

export const IpsecDetailsDrawer = (props: IpsecDetailsDrawerProps) => {
  const { visible, setVisible, ipsecId } = props
  const { $t } = useIntl()

  const { ipsecData, isLoading } = useGetIpsecViewDataListQuery(
    { payload: {
      fields: defaultIpsecFields,
      filters: { id: [ipsecId] }
    } },
    {
      skip: !ipsecId,
      selectFromResult: ({ data, isLoading }) => {
        return {
          ipsecData: (data?.data?.[0] ?? {}) as IpsecViewData,
          isLoading
        }
      }
    }
  )

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Profile Details: {name}' }, { name: ipsecData.name })}
      visible={visible}
      width={450}
      onClose={handleClose}
      destroyOnClose={true}
    >
      <Loader states={[{ isLoading }]}>
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item
              label={$t({ defaultMessage: 'Profile Name' })}
              children={ipsecData?.name}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Security Gateway IP/FQDN' })}
              children={ipsecData?.serverAddress}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Authentication' })}
              children={ipsecData?.authenticationType=== IpSecAuthEnum.PSK
                ? <div>{$t({ defaultMessage: 'Pre-shared Key' })}</div>
                : <div>{$t({ defaultMessage: 'Certificate' })}</div>}
            />
            {ipsecData?.authenticationType === IpSecAuthEnum.PSK &&
            <Form.Item label={$t({ defaultMessage: 'Pre-shared Key' })}
              children={
                <PasswordInput readOnly
                  value={ipsecData?.preSharedKey}
                  style={{ width: '100%', border: 'none' }} />
              } />
            }

            <Subtitle level={5}>
              { $t({ defaultMessage: 'Security Association' }) }
            </Subtitle>
            <>
              <Form.Item
                label={$t({ defaultMessage: 'IKE Proposal' })}
                children={
                  <label>{ipsecData.ikeProposalType === 'DEFAULT' ?
                    $t({ defaultMessage: 'Default' }) :
                    $t({ defaultMessage: 'Custom' })}</label>
                } />
              <Form.Item
                label={$t({ defaultMessage: 'ESP Proposal' })}
                children={
                  <label>{ipsecData.espProposalType === 'DEFAULT' ?
                    $t({ defaultMessage: 'Default' }) :
                    $t({ defaultMessage: 'Custom' })}</label>
                } />
            </>
          </Col>
        </Row>
      </Loader>
    </Drawer>
  )
}