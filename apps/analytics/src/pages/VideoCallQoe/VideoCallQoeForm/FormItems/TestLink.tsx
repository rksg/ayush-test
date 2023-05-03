import { useState } from 'react'

import { Space }                  from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import { FormattedMessage }       from 'react-intl'

import { Button } from '@acx-ui/components'

import * as UI from '../styledComponents'

const name = 'link' as const
const label = defineMessage({ defaultMessage: 'Call Details' })

export function TestLink ({ link, width='524px' }:{ link: string, width?: string }) {
  const { $t } = useIntl()
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
  }
  const linkDescription = <FormattedMessage
    defaultMessage={`
    <highlight>
    The meeting is accessible by clicking the URL above. Copy and share the URL
    with other participants.
    </highlight>
  `}
    values={{
      highlight: (chunks) => <Space align='start'>
        {chunks}
      </Space>
    }}
  />

  return <UI.FormItemNormal
    name={name}
    label={$t(label)}
    extra={
      linkDescription
    }
    children={
      <Space style={{ paddingTop: 10 }}>
        <UI.LinkButton type='link' style={{ width }}>
          <a
            className='link'
            target='_blank'
            href={link}
            rel='noreferrer'>
            {link}
          </a>
        </UI.LinkButton>
        <Button
          type='primary'
          style={{ marginLeft: 8.5 }}
          onClick={onCopy}
        >
          {
            copied ? $t({ defaultMessage: 'Copied' }):
              $t({ defaultMessage: 'Copy Link' })
          }
        </Button>
      </Space>
    }
  />
}
