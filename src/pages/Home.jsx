// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

function Home() {
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', category: '', date: '', time: ''
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [dateBookings, setDateBookings] = useState({});
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const categories = ["ST", "SC", "OBC", "General EWS", "General"];
  
  const TIME_SLOTS = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM"
  ];
  
  const MAX_SLOTS_PER_TIME = 3; 

  // Aaj ki date format karna (YYYY-MM-DD)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`;
  
  // Last date limit set karna
  const maxDate = "2026-03-08"; 

  // Check karna ki time nikal toh nahi gaya (Aaj ke din ke liye)
  const isTimePassed = (timeStr, selectedDate) => {
    if (selectedDate !== todayDate) return false;

    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (hours === 12 && modifier === 'AM') hours = 0;
    if (hours !== 12 && modifier === 'PM') hours += 12;

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    if (hours < currentHour) return true;
    if (hours === currentHour && minutes <= currentMinute) return true;
    return false;
  };

  useEffect(() => {
    if (!formData.date) return;

    const fetchBookedSlots = async () => {
      setFetchingSlots(true);
      try {
        const q = query(collection(db, "bookings"), where("date", "==", formData.date));
        const snapshot = await getDocs(q);
        
        const counts = {};
        snapshot.forEach(doc => {
          const time = doc.data().time;
          counts[time] = (counts[time] || 0) + 1;
        });
        
        setDateBookings(counts);
        
        // Agar select kiya hua time ab full ho chuka hai ya time nikal chuka hai, use clear karein
        if (counts[formData.time] >= MAX_SLOTS_PER_TIME || isTimePassed(formData.time, formData.date)) {
          setFormData(prev => ({ ...prev, time: '' }));
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
      setFetchingSlots(false);
    };

    fetchBookedSlots();
  }, [formData.date]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.time) {
      alert("Kripya ek valid Time Slot select karein.");
      return;
    }

    setLoading(true);

    try {
      const bookingsRef = collection(db, "bookings");

      const qMobile = query(bookingsRef, where("mobileNumber", "==", formData.mobileNumber));
      const mobileSnapshot = await getDocs(qMobile);
      if (!mobileSnapshot.empty) {
        alert("Is mobile number se pehle hi ek slot book ho chuka hai.");
        setLoading(false);
        return;
      }

      const qTime = query(bookingsRef, where("date", "==", formData.date), where("time", "==", formData.time));
      const timeSnapshot = await getDocs(qTime);
      if (timeSnapshot.size >= MAX_SLOTS_PER_TIME) {
        alert("Yeh slot abhi abhi full ho gaya hai. Kripya koi aur time select karein.");
        setDateBookings(prev => ({ ...prev, [formData.time]: timeSnapshot.size }));
        setFormData(prev => ({ ...prev, time: '' }));
        setLoading(false);
        return;
      }

      const generatedTokenId = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

      await addDoc(bookingsRef, {
        ...formData,
        tokenId: generatedTokenId,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      
      setToken(generatedTokenId);
      setFormData({ fullName: '', mobileNumber: '', category: '', date: '', time: '' });
    } catch (error) {
      console.error("Booking Error: ", error);
      alert("Booking failed. Please check your internet connection.");
    }
    setLoading(false);
  };

  if (token) {
    return (
      <div className="success-card">
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
        <h2 className="mb-4">Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-light)' }}>Your NEET Application slot is booked.</p>
        <div className="token-box">
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: 'var(--text-light)' }}>YOUR TOKEN ID</p>
          <h1 className="token-id">{token}</h1>
        </div>
        <button onClick={() => setToken(null)} className="btn btn-primary">Book Another Slot</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      
      {/* Warning Banner */}
      <div className="warning-banner">
        <strong>🚨 Server Warning: Apply Immediately!</strong><br/>
        NEET servers are slowing down. <strong>Last Date is 8th March.</strong><br/>
        Please fill your form as soon as possible.
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Form */}
        <div className="form-container-card" style={{ flex: '1', minWidth: '320px', margin: '0' }}>
          <h2 className="text-center mb-4">Book Your Slot</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" placeholder="Student Name" value={formData.fullName} onChange={handleChange} required className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" name="mobileNumber" placeholder="10-digit number" value={formData.mobileNumber} onChange={handleChange} required pattern="[0-9]{10}" className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Select Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required className="form-input" style={{ backgroundColor: 'white' }}>
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              {/* min aur max date lagayi gayi hai */}
              <input type="date" name="date" value={formData.date} onChange={handleChange} min={todayDate} max={maxDate} required className="form-input" />
            </div>

            {formData.date && (
              <div className="form-group">
                <label className="form-label">Select Time Slot</label>
                {fetchingSlots ? (
                  <p style={{ color: 'var(--primary-color)', fontSize: '14px' }}>Checking availability...</p>
                ) : (
                  <div className="slots-grid">
                    {TIME_SLOTS.map(time => {
                      const bookedCount = dateBookings[time] || 0;
                      const isFull = bookedCount >= MAX_SLOTS_PER_TIME;
                      const hasPassed = isTimePassed(time, formData.date); // Naya logic
                      const isDisabled = isFull || hasPassed;
                      const isSelected = formData.time === time;
                      const left = MAX_SLOTS_PER_TIME - bookedCount;

                      return (
                        <div 
                          key={time} 
                          className={`slot-box ${isDisabled ? 'slot-disabled' : ''} ${isSelected ? 'slot-selected' : ''}`}
                          onClick={() => !isDisabled && setFormData({ ...formData, time })}
                        >
                          <div className="slot-time">{time}</div>
                          <div className="slot-left">
                            {hasPassed ? 'Passed' : (isFull ? 'Full' : `${left} left`)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '10px' }}>
              {loading ? 'Processing...' : 'Confirm Booking Now'}
            </button>
          </form>
        </div>

        {/* Right Side: Information Panel */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="info-card">
            <h3 style={{ color: '#08bd80', marginBottom: '15px' }}>📄 Documents Required</h3>
            <ul className="docs-list">
              <li><strong>Aadhar Card</strong> (Original & Copy)</li>
              <li><strong>10th & 12th Marksheet</strong> (If pursuing, bring School Details)</li>
              <li><strong>Income Details</strong> of Parents</li>
              <li><strong>Caste Certificate</strong> (OBC, SC/ST, General-EWS)</li>
              <li>Valid <strong>Mobile No.</strong> & <strong>Email ID</strong> are mandatory.</li>
            </ul>
          </div>

          <div className="info-card contact-card">
            <h3 style={{ marginBottom: '10px' }}>📞 Need Help?</h3>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>
              Kisi bhi query ke liye aap humein call ya WhatsApp kar sakte hain:
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="tel:9131850359" className="contact-btn call-btn">Call Us</a>
              <a href="https://wa.me/919131850359" target="_blank" rel="noreferrer" className="contact-btn whatsapp-btn">WhatsApp</a>
            </div>
            <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>+91 91318 50359</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;