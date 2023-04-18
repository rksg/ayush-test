import { useState } from 'react'

import { Form, Space }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import { FormattedMessage }       from 'react-intl'

import { Button }           from '@acx-ui/components'
import { InformationSolid } from '@acx-ui/icons'

import { LinkButton } from '../styledComponents'

const name = 'link' as const
const label = defineMessage({ defaultMessage: 'Call Details' })

export function TestLink ({ link }:{ link: string }) {
  const { $t } = useIntl()
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
  }
  const linkDescription = <FormattedMessage
    defaultMessage={`
    <highlight>
    The meeting is accessible by the URL above. Copy and share the URL with other participants. 
    </highlight>
  `}
    values={{
      highlight: (chunks) => <Space align='start'>
        <InformationSolid />
        {chunks}
      </Space>
    }}
  />

  return <Form.Item
    name={name}
    label={$t(label)}
    extra={
      linkDescription
    }
    children={
      <Space>
        <LinkButton type='link'>
          <a
            className='link'
            target='_blank'
            href={link}
            rel='noreferrer'>
            {link}
          </a>
        </LinkButton>
        <Button
          type='primary'
          style={{ marginLeft: 7 }}
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
