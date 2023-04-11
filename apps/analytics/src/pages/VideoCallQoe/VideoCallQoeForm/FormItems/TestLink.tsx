import { Form, Input, Space }     from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import { FormattedMessage }       from 'react-intl'

import { Button }           from '@acx-ui/components'
import { InformationSolid } from '@acx-ui/icons'

//import { useDuplicateNameValidator } from '../../services'

const name = 'link' as const
const label = defineMessage({ defaultMessage: 'Call Details' })

export function TestLink ({ link }:{ link: string }) {
  const { $t } = useIntl()
  //const { editMode, initialValues } = useStepFormContext<{ name: string }>()
  //const duplicateNameValidator = useDuplicateNameValidator(editMode, initialValues?.name)

  const onCopy = async () => {
    navigator.clipboard.writeText(link)
  }
  const linkDescription = <FormattedMessage
  /* eslint-disable max-len */
    defaultMessage={`
    <highlight>
    The meeting is accessible by the URL above. Copy and share the URL with other participants. 
    </highlight>
  `}
    /* eslint-enable */
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
    children={<div style={{ display: 'flex' }}>
      <Input readOnly
        value={link}
      />
      <Button
        type='primary'
        style={{ alignSelf: 'baseline', marginLeft: 7 }}
        onClick={onCopy}
      >
        {$t({ defaultMessage: 'Copy Link' })}
      </Button>
    </div>}
  />
}
