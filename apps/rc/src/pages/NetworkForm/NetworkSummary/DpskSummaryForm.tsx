import { Form } from 'antd'

import { CreateNetworkFormFields, transformNetworkEncryption, transformDpskNetwork, DpskNetworkType } from '@acx-ui/rc/utils'

export function DpskSummaryForm (props: {
  summaryData: CreateNetworkFormFields;
}) {
  const { summaryData } = props
  return (
    <>
      <Form.Item
        label='Security Protocol:'
        children={transformNetworkEncryption(summaryData.dpskWlanSecurity)}
      />
      {
        !summaryData.isCloudpathEnabled && (
          <>
            <Form.Item
              label='Passphrase Format:'
              children={transformDpskNetwork(DpskNetworkType.FORMAT, summaryData.passphraseFormat)}
            />
            <Form.Item
              label='Passphrase Length:'
              children={transformDpskNetwork(DpskNetworkType.LENGTH, summaryData.passphraseLength)}
            />
            <Form.Item
              label='Passphrase Expiration:'
              children={transformDpskNetwork(DpskNetworkType.EXPIRATION, summaryData.expiration)}
            />
          </>
        )
      }
    </> 
  )
}

