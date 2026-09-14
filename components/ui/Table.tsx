import React from 'react';

interface TableProps {
  columns: React.ReactNode[];
  children: React.ReactNode;
}

export default function Table({ columns, children }: TableProps) {
  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
