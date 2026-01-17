// src/components/SlotCard.jsx
import React from 'react'

export default function SlotCard({slot, onBook}){
  const status = slot.status || 'available';
  const price = (slot.price !== undefined && slot.price !== null) ? slot.price : 5; // fallback
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-bold">{slot.name}</div>
          <div className="text-sm text-slate-500">{slot.location}</div>
          <div className="mt-3 text-slate-700 font-semibold">
            <span className="text-blue-600 mr-1">$</span>
            <span className="text-xl">{price}</span><span className="text-base">/hour</span>
          </div>
        </div>
        <div>
          {status === 'available' && <div className="badge badge-available">Available</div>}
          {status === 'booked' && <div className="badge badge-booked">Booked</div>}
          {status === 'maintenance' && <div className="badge badge-maint">Maintenance</div>}
          {status === 'occupied' && <div className="badge badge-booked">Occupied</div>}
        </div>
      </div>

      <div className="mt-6">
        <button
          disabled={status !== 'available'}
          className={`w-full ${status==='available'?'btn-primary':'btn-ghost'}`}
          onClick={()=>onBook(slot)}
        >
          { status === 'available' ? 'Book Now' : 'Not Available' }
        </button>
      </div>
    </div>
  )
}
