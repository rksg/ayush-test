import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType }                  from '@acx-ui/components'
import { AddEdgeMdnsProxyForm, useEdgeMdnsActions }  from '@acx-ui/rc/components'
import { EdgeMdnsProxyUrls, EdgeMdnsProxyViewData  } from '@acx-ui/rc/utils'
import { getOpsApi }                                 from '@acx-ui/utils'

export const MdnsAddModal = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const { createEdgeMdns } = useEdgeMdnsActions()

  const handleCreate = async (data: EdgeMdnsProxyViewData) => {
    try {
      await createEdgeMdns(data)
    } finally {
      setVisible(false)
    }
  }

  return (
    <>
      <Button type='link'
        rbacOpsIds={[getOpsApi(EdgeMdnsProxyUrls.addEdgeMdnsProxy)]}
        onClick={() => setVisible(true)}>
        {$t({ defaultMessage: 'Add Service' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add mDNS Proxy' })}
        width={1000}
        visible={visible}
        type={ModalType.ModalStepsForm}
        mask={true}
        destroyOnClose={true}
      >
        <AddEdgeMdnsProxyForm
          onFinish={handleCreate}
          onCancel={() => setVisible(false)}
        />
      </Modal>
    </>
  )
}