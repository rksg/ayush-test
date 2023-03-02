import { CSSProperties, useEffect, useRef, useState } from 'react'

import { Input, InputRef, Space, Tag, Tooltip } from 'antd'
import _                                        from 'lodash'
import { useIntl }                              from 'react-intl'

import { Plus } from '@acx-ui/icons'

export interface TagData {
  value: string,
  isInValid?: boolean,
  isUsed?: boolean
}

interface MacAddressesTagsProps {
  maxNumOfTags?: number,
  usedMacAddrs?: string[],
  tags: TagData[],
  tagsChanged: (data: TagData[]) => void
}

export const MacAddressesTags = (props: MacAddressesTagsProps) => {
  const { $t } = useIntl()

  const { maxNumOfTags, usedMacAddrs=[], tags=[], tagsChanged } = props

  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState('')
  const [hasMacFormatError, setHasMacFormatError] = useState(false)
  const [isUsedMacAddr, setIsUsedMacAddr] = useState(false)

  const inputRef = useRef<InputRef>(null)
  const editInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  useEffect(() => {
    editInputRef.current?.focus()
  }, [inputValue])


  const handleClose = (removedTag: TagData) => {
    const { isInValid = false, isUsed = false } = removedTag
    const newTags = tags.filter((tag) => tag.value !== removedTag.value)
    tagsChanged(newTags)

    if (isInValid) setHasMacFormatError(false)
    if (isUsed) setIsUsedMacAddr(false)
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const convertToStandardMacAddress = (macAddress: string): string => {
    let result = macAddress.toUpperCase()

    if (_.includes(macAddress, '-')) {
      result = result.replace(/-/g, ':')
    } else if (_.includes(macAddress, '.') || !_.includes(macAddress, ':')) {
      result = result.replace(/\./g, '')
      const len = result.length
      const ret = []
      for (let i = 0; i < len; i += 2) {
        ret.push(result.substring(i, i+2))
      }
      result = ret.join(':')
    }

    return result
  }

  const isValidMacAddress = (macAddress: string) => {

    const regex = (_.includes(macAddress, ':') || _.includes(macAddress, '-'))
      ? /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/
      : (_.includes(macAddress, '.'))
        ? /^([0-9A-F]{4}[.]){2}([0-9A-F]{4})$/
        : /^([0-9A-F]{12})$/

    return regex.test(macAddress.toUpperCase())
  }

  const createTagData = (inputVaue: string) => {
    const isValid = isValidMacAddress(inputVaue)
    const newTagValue = isValid? convertToStandardMacAddress(inputValue) : inputVaue
    const isUsed = isValid && _.includes(usedMacAddrs, inputVaue)

    return {
      value: newTagValue,
      isInValid: !isValid,
      isUsed
    }
  }

  const handleInputConfirm = () => {
    if (inputValue) {
      const newTag = createTagData(inputValue)
      const tagValues = tags.map(tag => tag.value)

      if (!_.includes(tagValues, newTag.value)) {
        const newData = [...tags, newTag]
        tagsChanged(newData)

        setHasMacFormatError(newTag.isInValid)
        setIsUsedMacAddr(newTag.isUsed)
      }
    }
    setInputVisible(false)
    setInputValue('')
  }


  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value)
  }

  const handleEditInputConfirm = () => {
    if (editInputValue) {
      const editTag = createTagData(editInputValue)

      const newTags = [...tags]
      newTags[editInputIndex] = editTag
      tagsChanged(newTags)
    }
    setEditInputIndex(-1)
    setInputValue('')
  }

  const tagWidth = '140px'
  const borderRadius = '20px'

  const tagInputStyle: CSSProperties = {
    width: tagWidth,
    verticalAlign: 'top',
    borderRadius
  }

  const tagPlusStyle: CSSProperties = {
    width: tagWidth,
    borderRadius
  }

  const tagStyle: CSSProperties = {
    width: tagWidth,
    userSelect: 'none',
    borderRadius,
    backgroundColor: 'black'

  }

  const tagFailStyle: CSSProperties = {
    width: tagWidth,
    userSelect: 'none',
    borderRadius,
    backgroundColor: 'red'
  }

  const InputTag =(inputVisible ? (
    <Input
      ref={inputRef}
      type='text'
      size='small'
      style={tagInputStyle}
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleInputConfirm}
      onPressEnter={handleInputConfirm}
    />
  ) : (
    <Tag
      style={tagPlusStyle}
      onClick={showInput}
      icon={<Plus style={{ verticalAlign: 'middle' }}/>}
    >
      { $t({ defaultMessage: 'Add MAC Address' }) }
    </Tag>
  ))

  return (
    <Space direction='vertical' style={{ paddingTop: '20px' }}>
      <Space size={[0, 8]} wrap>
        <Space size={[0, 8]} wrap>
          {tags.map((tag, index) => {
            const tagValue = tag.value
            if (editInputIndex === index) {
              return (
                <Input
                  ref={editInputRef}
                  key={tagValue}
                  size='small'
                  style={tagInputStyle}
                  value={editInputValue}
                  onChange={handleEditInputChange}
                  onBlur={handleEditInputConfirm}
                  onPressEnter={handleEditInputConfirm}
                />
              )
            }
            const isLongTag = tagValue.length > 20
            const tagElem = (
              <Tag
                key={tagValue}
                closable={true}
                color='white'
                style={(tag.isInValid || tag.isUsed)? tagFailStyle : tagStyle}
                onClose={() => handleClose(tag)}
              >
                <span>
                  {isLongTag ? `${tagValue.slice(0, 20)}...` : tagValue}
                </span>
              </Tag>
            )
            return isLongTag ? (
              <Tooltip title={tagValue} key={tagValue}>
                {tagElem}
              </Tooltip>
            ) : (
              tagElem
            )
          })}
        </Space>
        { !hasMacFormatError && !isUsedMacAddr &&
          (!maxNumOfTags || tags.length < maxNumOfTags) && InputTag
        }
      </Space>
      {hasMacFormatError &&
        <div style={{ color: 'red' }}>
          {$t({ defaultMessage: 'The format of a MAC address is not correct.' })}
        </div>
      }
      {isUsedMacAddr &&
        <div style={{ color: 'red' }}>
          {$t({ defaultMessage: 'The MAC address has already existed.' })}
        </div>
      }
    </Space>
  )
}

