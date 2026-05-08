import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { isAdminEmail } from '../config/admin';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetched);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/10">
        <h1 className="text-2xl md:text-3xl font-serif">Users</h1>
      </div>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-background/60">
            <tr>
              <th className="font-medium p-4">User Details</th>
              <th className="font-medium p-4">Role</th>
              <th className="font-medium p-4">Joined Date</th>
              <th className="font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-black/[0.02] border-b border-black/5 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-serif text-lg text-black/60 uppercase">
                      {(user.displayName || user.email || 'U').charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.displayName || 'Unknown User'}</div>
                      <div className="text-xs text-black/50 font-mono">{user.email || 'No email provided'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${user.role === 'admin' || isAdminEmail(user.email) ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role === 'admin' || isAdminEmail(user.email) ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="p-4 text-sm text-black/60">
                  {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4">
                  <button className="text-sm border border-black/20 px-3 py-1 rounded hover:bg-black/5 transition-colors">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-background/40">No actual users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
