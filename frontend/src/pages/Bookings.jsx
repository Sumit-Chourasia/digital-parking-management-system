import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function Bookings(){
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('dp_user') || 'null');

  async function fetchHistory(){
    if (!user) return;
    const r = await axios.get(`http://localhost:4000/api/bookings/${user.username}`);
    setHistory(r.data);
  }

  useEffect(()=>{ fetchHistory(); }, []);

  if (!user) return <div className="mt-8">Login to view bookings</div>

  return (
    <div>
      <h2 className="text-2xl font-bold">My Bookings</h2>
      <div className="mt-4 space-y-4">
        {history.length === 0 ? <div className="text-slate-500">No bookings yet.</div> : history.map(h=>(
          <div key={h.id} className="card">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{h.slot_name}</div>
                <div className="text-sm text-slate-500">{h.slot_location}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${h.amount}</div>
                <div className="text-sm text-slate-500">{new Date(h.created_at).toLocaleString()}</div>
                <div className="text-sm text-slate-500">Receipt: {h.receipt_id}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
