interface ToolbarField {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export const AdminTableToolbar = ({
  action,
  fields,
}: {
  action: string;
  fields: ToolbarField[];
}) => (
  <form action={action} className="admin-toolbar">
    {fields.map((field) => (
      <div className="field" key={field.name}>
        <label>{field.label}</label>
        {field.options ? (
          <select name={field.name} defaultValue={field.value ?? ""}>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input name={field.name} defaultValue={field.value ?? ""} placeholder={field.placeholder} />
        )}
      </div>
    ))}
    <div className="inline-actions">
      <button className="primary-button" type="submit">
        Apply
      </button>
    </div>
  </form>
);
