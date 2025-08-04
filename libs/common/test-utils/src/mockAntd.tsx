export type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown, disabled: boolean, title?: string }>
  loading?: boolean
  dropdownClassName?: string
}>

export const MockSelect = ({
  loading, children,
  onChange, options,
  dropdownClassName,
  ...props
}: MockSelectProps) => (
  <select {...props} onChange={(e) => onChange?.(e.target.value)}>
    {options?.map((option, index) => (
      <option
        key={`option-${index}`}
        value={option.value as string}
        disabled={option.disabled}
        title={option.title}
      >
        {option.label}
      </option>
    ))}
    {children}
  </select>
)