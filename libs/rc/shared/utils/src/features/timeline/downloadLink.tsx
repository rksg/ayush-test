import { useEffect, useState } from 'react'

import { Tooltip } from 'antd'

import { getIntl } from '@acx-ui/utils'

export default function DownloadLink (props: {
      values: { [k: string]: string }
    }) {
  const { values } = props
  const [isLinkExpired, setIsLinkExpired] = useState(false)
  const { $t } = getIntl()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (values['downloadLinkCreatedTime'] && values['downloadLinkExpiry']) {
      // downloadLinkExpiry is in minutes e.g. 1440 minutes means 24 hours
      const expiryInMilliseconds = Number(values['downloadLinkExpiry']) * 60 * 1000
      const currentDate = new Date()
      const currentTimestamp = currentDate.getTime()

      const createdInMilliseconds = Number(values['downloadLinkCreatedTime'])

      const expiryDifference = currentTimestamp - createdInMilliseconds

      if (expiryDifference < expiryInMilliseconds) {
        const delay = expiryInMilliseconds - expiryDifference
        setIsLinkExpired(false)
        timer = setTimeout(() => {
          setIsLinkExpired(true)
        }, delay)
      } else {
        setIsLinkExpired(true)
      }
    }

    return () => {
      clearTimeout(timer)
    }

  }, [values])

  return (!isLinkExpired && values['downloadLink'])
    ? <a
      style={{
        color: 'var(--acx-accents-blue-50)'
      }}
      href={values['downloadLink']}>
      { values['linkAlias'] }
    </a>
    : <Tooltip
      placement='bottom'
      title={$t({ defaultMessage: 'Not Available' })}>
      <span style={{
        color: 'var(--acx-neutrals-50)',
        cursor: 'not-allowed'
      }}>{ values['linkAlias'] }</span>
    </Tooltip>
}