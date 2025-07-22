import { memo, useRef, useState } from 'react'

import { Tag, Select }                   from 'antd'
import { RuleObject }                    from 'antd/lib/form'
import { DndProvider, useDrop, useDrag } from 'react-dnd'
import { HTML5Backend }                  from 'react-dnd-html5-backend'
import { useIntl }                       from 'react-intl'
import { v4 as uuidv4 }                  from 'uuid'

import { Remove } from '@acx-ui/icons'
import { Plus }   from '@acx-ui/icons-new'

import * as UI from './styledComponents'

export type DraggableTag = {
  id: string
  value: string
  valid: boolean
  isCustom?: boolean
}

export type DraggableTagSelectorProps = {
  values?: DraggableTag[]
  onChange?: (val: DraggableTag[]) => void
  options: string[]
  maxTags: number
  status?: '' | 'error'
  customTagRules: RuleObject[]
  readonly?: boolean
}

const type = 'TAG'
const DraggableTagItem = memo(({
  tag,
  index,
  moveTag,
  removeTag,
  readonly = false
}: {
  tag: DraggableTag
  index: number
  moveTag: (from: number, to: number) => void
  removeTag: (index: number) => void
  readonly?: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)

  // Only enable drop functionality if not readonly
  const [, drop] = useDrop({
    accept: type,
    hover (item: { index: number }) {
      if (!readonly && item.index !== index) {
        moveTag(item.index, index)
        item.index = index
      }
    }
  })

  // Only enable drag functionality if not readonly
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: !readonly // Disable drag when readonly
  })

  // Only apply drag/drop refs if not readonly
  if (!readonly) {
    drag(drop(ref))
  }

  return (
    <UI.TagWrapper>
      <Tag
        ref={ref}
        closable={!readonly} // Disable close button when readonly
        onClose={readonly ? undefined : () => removeTag(index)}
        closeIcon={readonly ? undefined : <Remove data-testid='close' />}
        className={tag.valid ? '' : 'invalid'}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: readonly ? 'default' : 'move' // Change cursor based on readonly state
        }}
      >
        {tag.value}
      </Tag>
    </UI.TagWrapper>
  )
})

export function DraggableTagSelector ({
  values = [],
  onChange,
  options,
  maxTags,
  status = '',
  customTagRules,
  readonly = false
}: DraggableTagSelectorProps) {
  const { $t } = useIntl()
  const [selectVisible, setSelectVisible] = useState(false)

  const moveTag = (from: number, to: number) => {
    const newTags = [...values]
    const [moved] = newTags.splice(from, 1)
    newTags.splice(to, 0, moved)
    onChange?.(newTags)
  }

  const removeTag = (index: number) => {
    const newTags = values.filter((_, i) => i !== index)
    onChange?.(newTags)
  }

  const handleSelect = async (val: string) => {
    const allowedOptions = options.filter(opt => !values.some((t) => t.value === opt))
    const isCustom = !allowedOptions.includes(val)
    const tag = { id: uuidv4(), value: val, valid: true, isCustom }

    if (isCustom) {
      for (const rule of customTagRules) {
        try {
          const { id, value } = tag
          await rule.validator?.(rule, [{ id, value }], () => {})
        } catch (_) {
          tag.valid = false
          break
        }
      }
    }

    const newTags = [...values, tag]
    onChange?.(newTags)
    setSelectVisible(false)
  }

  const AddTag = () => {
    return <UI.AddTag
      data-testid='add-tag'
      onClick={() => !readonly && setSelectVisible(true)}>
      <Plus size='sm' />
    </UI.AddTag>
  }

  const TagPlaceholder = () => {
    return <UI.Placeholder
      onClick={() => {
        if (!readonly) {
          const visible = !values.length && !selectVisible
          setSelectVisible(visible)
        }
      }}
    >
      {$t({ defaultMessage: 'Add attribute' })}
    </UI.Placeholder>
  }

  const showAddMoreTags = !readonly && values.length < maxTags &&
    values.every(v => v.valid)
  const hasAnyTags = values.length > 0
  const TagAction = () => {
    if (!showAddMoreTags) return null
    return hasAnyTags ? <AddTag /> : <TagPlaceholder />
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <UI.TagsContainer
        className={status === 'error'
          ? 'error' : (selectVisible ? 'active' : '')
        }
      >
        <span>{
          values.map((tag, i) => (
            <DraggableTagItem
              key={`${tag.id}-${tag.valid}`}
              tag={tag}
              index={i}
              moveTag={moveTag}
              removeTag={removeTag}
              readonly={readonly}
            />
          ))
        }</span>

        {selectVisible ? (
          <UI.TagSelector>
            <Select
              data-testid='select-tag'
              size='small'
              mode='tags'
              autoFocus
              onBlur={() => setSelectVisible(false)}
              onSelect={handleSelect}
              dropdownMatchSelectWidth={false}
              open={true}
            >
              {options
                .filter((opt) => !values.some(t => t.value === opt))
                .map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
                ))}
            </Select>
          </UI.TagSelector>
        ) : <TagAction />}

      </UI.TagsContainer>
    </DndProvider>
  )
}
