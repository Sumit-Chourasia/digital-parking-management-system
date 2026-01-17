import React, {useEffect, useState} from 'react'
import axios from 'axios'
import SlotCard from '../components/SlotCard'
import BookingModal from '../components/BookingModal'
import ViolationForm from '../components/ViolationForm'

export default function Dashboard(){
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openBooking, setOpenBooking] = useState(false);

  useEffect(()=>{ fetchSlots(); }, []);

  async function fetchSlots(){
    try {
      const r = await axios.get('http://localhost:4000/api/slots');
      setSlots(r.data);
    } catch(e){ console.error(e); }
  }

  function onBook(slot){
    setSelected(slot);
    setOpenBooking(true);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-slate-500">Find and book parking slots or report violations</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {slots.map(s => <SlotCard key={s.id} slot={s} onBook={onBook} />)}
      </div>

      {openBooking && selected && <BookingModal slot={selected} onClose={()=>{ setOpenBooking(false); fetchSlots(); }} />}
      <div className="mt-8">
        <ViolationForm />
      </div>
    </div>
  )
}
