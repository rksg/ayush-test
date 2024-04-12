export type MockSelectProps = React.PropsWithChildren<{
  value: string | number
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>

export const MockSelectComp = ({ loading, children, onChange, value, options,
  dropdownClassName, ...props }: MockSelectProps) => (
  <select {...props} onChange={(e) => onChange?.(e.target.value)} value={value}>
    {/* Additional <option> to ensure it is possible to reset value to empty */}
    {children ? <><option value={undefined}></option>{children}</> : null}
    {options?.map((option) => (
      <option
        key={`option-${option.value}`}
        value={option.value as string}>
        {option.label}
      </option>
    ))}
  </select>
)

MockSelectComp.Option = 'option'