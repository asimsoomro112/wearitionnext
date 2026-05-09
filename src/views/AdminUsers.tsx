"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { isAdminEmail } from '../config/admin';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Users Page Load Error:", error);
      // Fallback: try without sorting if index is missing
      const qFallback = query(collection(db, 'users'));
      onSnapshot(qFallback, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, () => setLoading(false));
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-12 text-center text-[#0a0a0a]/60">Loading users...</div>;

  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-8 pb-6 border-b border-black/10 text-[#0a0a0a]">User Management</h1>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-[#0a0a0a]/60">
            <tr>
              <th className="font-medium p-4">Name</th>
              <th className="font-medium p-4">Email</th>
              <th className="font-medium p-4">Role</th>
              <th className="font-medium p-4 text-right">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-black/[0.02] border-b border-black/5 last:border-0">
                <td className="p-4 text-sm font-medium text-[#0a0a0a]">{user.displayName || 'User'}</td>
                <td className="p-4 text-sm text-[#0a0a0a]/70">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                    isAdminEmail(user.email) ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAdminEmail(user.email) ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="p-4 text-sm text-[#0a0a0a]/60 text-right">
                  {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="p-12 text-center text-[#0a0a0a]/40">No actual users found in the system.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
