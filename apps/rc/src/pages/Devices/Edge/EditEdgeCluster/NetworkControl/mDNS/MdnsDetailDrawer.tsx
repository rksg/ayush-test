import { useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Button, Drawer, Loader }        from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable } from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyQuery }      from '@acx-ui/rc/services'
import {
  MdnsProxyFeatureTypeEnum,
  NewMdnsProxyForwardingRule
} from '@acx-ui/rc/utils'

interface MdnsDetailDrawerProps {
  serviceId: string
}

export const MdnsDetailDrawer = (props: MdnsDetailDrawerProps) => {
  const { serviceId } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState<boolean>(false)

  const { data, isLoading, isFetching } = useGetEdgeMdnsProxyQuery(
    { params: { serviceId } },
    { skip: !serviceId || !visible }
  )

  const handleClose = () => {
    setVisible(false)
  }

  return <>
    <Button type='link' onClick={() => setVisible(true)} disabled={!serviceId}>
      {$t({ defaultMessage: 'Profile Details' })}
    </Button>
    <Drawer
      title={$t(
        { defaultMessage: 'mDNS Proxy Profile Details : {profileName}' },
        { profileName: data?.name }
      )}
      visible={visible}
      onClose={handleClose}
      width={500}
    >
      <Loader states={[{ isLoading, isFetching }]}>
        <Typography.Text>
          {$t({ defaultMessage: 'Forwarding rules:' })}
        </Typography.Text>
        <MdnsProxyForwardingRulesTable
          featureType={MdnsProxyFeatureTypeEnum.EDGE}
          readonly
          rules={data?.forwardingRules
            // eslint-disable-next-line max-len
            .map(rule => ({ ...rule, service: rule.serviceType })) as unknown as NewMdnsProxyForwardingRule[]}
        />
      </Loader>
    </Drawer>
  </>
}