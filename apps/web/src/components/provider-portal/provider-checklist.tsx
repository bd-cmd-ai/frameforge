export const ProviderChecklist = ({
  items,
}: {
  items: Array<{ key: string; label: string; done: boolean }>;
}) => (
  <div className="checklist">
    {items.map((item) => (
      <div key={item.key} className="checklist-item">
        <span className={`checklist-indicator ${item.done ? "done" : "pending"}`} />
        <div>
          <strong>{item.label}</strong>
          <p className="muted">{item.done ? "Completed" : "Still needs attention"}</p>
        </div>
      </div>
    ))}
  </div>
);
