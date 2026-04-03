import React from 'react';

function DataTable({ columns, data, emptyMessage = 'No records available' }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="table-base">
        <thead className="table-head">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="table-head-cell">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className={rowIndex % 2 ? 'table-row bg-neutral-50/60' : 'table-row'}>
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
