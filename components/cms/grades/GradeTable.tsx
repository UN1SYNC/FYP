interface GradeTableProps {
  items: any[];
}

export const GradeTable = ({ items }: GradeTableProps) => {
  return (
    <table className="w-full border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Total Marks</th>
          <th className="px-4 py-2 border">Obtained Marks</th>
          <th className="px-4 py-2 border">Average</th>
          <th className="px-4 py-2 border">Percentage</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index} className="odd:bg-white even:bg-gray-50">
            <td className="px-4 py-2 border">{item.name}</td>
            <td className="px-4 py-2 border text-center">{item.total}</td>
            <td className="px-4 py-2 border text-center">{item.obtained}</td>
            <td className="px-4 py-2 border text-center">{item.average}</td>
            <td className="px-4 py-2 border text-center">{item.percentage}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
