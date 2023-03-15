import { CSSProperties, useEffect, useRef, useState } from 'react'

import { Input, InputRef, Space, Tag, Tooltip } from 'antd'
import _                                        from 'lodash'
import { useIntl }                              from 'react-intl'

import { Plus } from '@acx-ui/icons'

export interface TagData {
  value: string,
  isInValid?: boolean,
  isUsed?: boolean,
  isUsedOtherRules?: boolean
}

interface MacAddressesTagsProps {
  maxNumOfTags?: number,
  usedMacAddrs?: string[],
  otherUsedMacAddrs?: string[]
  tags: TagData[],
  tagsChanged: (data: TagData[]) => void
}

enum MacErrorTypeEnum {
  None,
  Format,
  IsCurrentRuleUsed,
  IsOtherRulesUsed
}

export const MacAddressesTags = (props: MacAddressesTagsProps) => {
  const { $t } = useIntl()

  const { maxNumOfTags, usedMacAddrs=[], otherUsedMacAddrs=[], tags=[], tagsChanged } = props

  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [macErrorType, setMacErrorType] = useState(MacErrorTypeEnum.None)
  const inputRef = useRef<InputRef>(null)
  const editInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (tags.length === 0) {
      setMacErrorType(MacErrorTypeEnum.None)
    }
  }, [tags])

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  useEffect(() => {
    editInputRef.current?.focus()
  }, [inputValue])


  const handleClose = (removedTag: TagData) => {
    const { isInValid = false, isUsed = false, isUsedOtherRules = false } = removedTag
    const newTags = tags.filter((tag) => tag.value !== removedTag.value)
    tagsChanged(newTags)

    if (isInValid && macErrorType === MacErrorTypeEnum.Format) {
      setMacErrorType(MacErrorTypeEnum.None)
    } else if (isUsed && macErrorType === MacErrorTypeEnum.IsCurrentRuleUsed) {
      setMacErrorType(MacErrorTypeEnum.None)
    } else if (isUsedOtherRules && macErrorType === MacErrorTypeEnum.IsOtherRulesUsed) {
      setMacErrorType(MacErrorTypeEnum.None)
    }
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
    const isUsedOtherRules = isValid && _.includes(otherUsedMacAddrs, inputVaue)

    return {
      value: newTagValue,
      isInValid: !isValid,
      isUsed,
      isUsedOtherRules
    }
  }

  const handleInputConfirm = () => {
    if (inputValue) {
      const newTag = createTagData(inputValue)
      const tagValues = tags.map(tag => tag.value)

      if (!_.includes(tagValues, newTag.value)) {
        const newData = [...tags, newTag]
        tagsChanged(newData)

        const { isInValid, isUsed, isUsedOtherRules } = newTag
        if (isInValid) {
          setMacErrorType(MacErrorTypeEnum.Format)
        } else if (isUsed) {
          setMacErrorType(MacErrorTypeEnum.IsCurrentRuleUsed)
        } else if (isUsedOtherRules) {
          setMacErrorType(MacErrorTypeEnum.IsOtherRulesUsed)
        } else {
          setMacErrorType(MacErrorTypeEnum.None)
        }
      }
    }
    setInputVisible(false)
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
      data-testid='InputTagField'
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
      data-testid='InputTag'
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
          {tags.map((tag) => {
            const tagValue = tag.value
            const isLongTag = tagValue.length > 20
            const tagElem = (
              <Tag
                data-testid={`${tagValue}_tag`}
                key={tagValue}
                closable={true}
                color='white'
                style={(tag.isInValid || tag.isUsed || tag.isUsedOtherRules)
                  ? tagFailStyle : tagStyle}
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
        { macErrorType === MacErrorTypeEnum.None &&
          (!maxNumOfTags || tags.length < maxNumOfTags) && InputTag
        }
      </Space>
      {macErrorType === MacErrorTypeEnum.Format &&
        <div style={{ color: 'red' }}>
          {$t({ defaultMessage: 'The format of a MAC address is not correct.' })}
        </div>
      }
      {macErrorType === MacErrorTypeEnum.IsCurrentRuleUsed &&
        <div style={{ color: 'red' }}>
          {$t({ defaultMessage: 'You have entered a duplicate MAC address already in use.' })}
        </div>
      }
      {macErrorType === MacErrorTypeEnum.IsOtherRulesUsed &&
        <div style={{ color: 'red' }}>
          {$t({ defaultMessage:
            'You have already entered this MAC address for this service type.' })}
        </div>
      }
    </Space>
  )
}

