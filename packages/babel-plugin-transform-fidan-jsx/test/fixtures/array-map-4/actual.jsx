<tr>
  {gridColumns.map(col => (
    <th
      className={classNames({ active: sortKey$ == col })}
      onClick={() => sortBy(filteredData$, col)}
    >
      <span>{col}</span>
    </th>
  ))}
</tr>;
