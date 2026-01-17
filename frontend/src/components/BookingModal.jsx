// src/components/BookingModal.jsx
import React, {useState} from 'react'
import axios from 'axios'

export default function BookingModal({slot, onClose}) {
  const user = JSON.parse(localStorage.getItem('dp_user') || 'null');
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(1);
  const price = (slot.price !== undefined && slot.price !== null) ? Number(slot.price) : 5;
  const amount = (price * hours).toFixed(2);

  async function payAndBook(){
    if (!user) { alert('Login first'); return; }
    setLoading(true);
    try {
      // create session with the computed amount
      const create = await axios.post('http://localhost:4000/api/payment/create', {
        amount: Number(amount),
        username: user.username,
        slotId: slot.id
      });

      // confirm (demo)
      const confirm = await axios.post('http://localhost:4000/api/payment/confirm', {
        sessionId: create.data.sessionId,
        slotId: slot.id,
        username: user.username,
        amount: Number(amount)
      });

      if (confirm.data.success) {
        alert(`Payment successful. Slot booked for ${hours} hour(s).`);
        onClose();
      } else {
        alert('Payment failed');
      }
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.error || 'Payment error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-6 w-[560px]">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Book — {slot.name}</h3>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="mt-4">
          <div className="text-sm text-slate-500">Location: {slot.location}</div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Hours</label>
              <select value={hours} onChange={e=>setHours(Number(e.target.value))} className="w-full mt-1 border rounded-md px-3 py-2">
                {Array.from({length:12}, (_,i)=>i+1).map(h=>(
                  <option key={h} value={h}>{h} hour{h>1?'s':''}</option>
                ))}
              </select>
              <div className="text-sm text-slate-500 mt-2">Choose how long you want to reserve the slot</div>
            </div>

            <div>
              <label className="text-sm font-medium">Amount</label>
              <div className="mt-1 text-2xl font-bold text-slate-800">${amount}</div>
              <div className="text-sm text-slate-500 mt-2">${price}/hour × {hours} hour{hours>1?'s':''}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={payAndBook} disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : `Pay $${amount} & Book`}
            </button>
            <button onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
