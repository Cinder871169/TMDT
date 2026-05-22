import React from "react";

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs = [],
}) {
  return (
    <div className="page-header">
      <div>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
