'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [student, setStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      // Mock fetch
      setStudent({ id, fullName: 'John Doe', matricNo: '12345', programme: 'Computer Science' });
      setHistory([
        { id: 1, date: '2023-10-01', meeting: 'Morning Prayer', status: 'Present' },
        { id: 2, date: '2023-09-28', meeting: 'Evening Prayer', status: 'Absent' },
      ]);
    }
  }, [id]);

  if (!student) return <div className="p-8 text-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-black">← Back</button>
        <h1 className="text-2xl font-bold">Student Profile</h1>
      </div>

      <div className="grid grid-2 gap-6">
        <div className="card">
          <div className="card-header"><h2 className="text-xl font-bold">Details</h2></div>
          <div className="card-body">
            <div className="mb-2"><span className="text-muted">Name:</span> <span className="font-bold">{student.fullName}</span></div>
            <div className="mb-2"><span className="text-muted">Matric No:</span> <span className="font-bold">{student.matricNo}</span></div>
            <div className="mb-2"><span className="text-muted">Programme:</span> <span className="font-bold">{student.programme || 'N/A'}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="text-xl font-bold">Attendance Overview</h2></div>
          <div className="card-body">
            <div className="grid grid-2 gap-4">
              <div className="p-4 bg-green-50 rounded text-center">
                <div className="text-sm text-green-800">Present</div>
                <div className="text-2xl font-bold text-green-600">85%</div>
              </div>
              <div className="p-4 bg-red-50 rounded text-center">
                <div className="text-sm text-red-800">Absent</div>
                <div className="text-2xl font-bold text-red-600">15%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header"><h2 className="text-xl font-bold">Attendance History</h2></div>
        <div className="card-body p-0">
          <table className="table w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Date</th>
                <th className="p-3">Meeting</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(record => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{record.date}</td>
                  <td className="p-3">{record.meeting}</td>
                  <td className="p-3">
                    <span className={`badge ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 rounded text-xs`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
