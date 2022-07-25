import React from 'react'

import { Input }   from 'antd'
import { useIntl } from 'react-intl'

import { SearchOutlined } from '@acx-ui/icons'

import { Wrapper } from './styledComponents'

function SearchBar (props: { onChange: (value: string) => void }) {
  return <Wrapper><Input
    placeholder={useIntl().$t({ defaultMessage: 'Search for...' })}
    prefix={<SearchOutlined />}
    onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => props.onChange(value)}
  /></Wrapper>
}

export { SearchBar }