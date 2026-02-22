// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Ankush@7987') {
      setIsAuthenticated(true);
      fetchBookings();
    } else {
      alert("Incorrect Password!");
      setPassword('');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    } catch (error) {
      console.error("Fetch Error: ", error);
    }
    setLoading(false);
  };

  const markSuccess = async (id) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: 'Success' });
      // Local state update for smooth animation without fetching all data again
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Success' } : b));
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const deleteBooking = async (id) => {
    if(window.confirm("Kya aap sach me is slot ko delete karna chahte hain?")) {
      try {
        await deleteDoc(doc(db, "bookings", id));
        setBookings(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting doc: ", error);
      }
    }
  };

  // Data processing and Sorting
  const processedBookings = bookings.map(b => {
    const bookingDateTime = new Date(`${b.date}T${b.time}`);
    const now = new Date();
    const diffHours = (now - bookingDateTime) / (1000 * 60 * 60);
    
    let displayStatus = b.status || 'Pending';
    // Agar status pending hai aur time ko 1 ghante se zyada ho gaya hai toh Expired maane
    if (displayStatus === 'Pending' && diffHours > 1) {
      displayStatus = 'Expired';
    }

    return { ...b, displayStatus, bookingDateTime };
  }).sort((a, b) => {
    // Priority: 1. Pending, 2. Success, 3. Expired
    const order = { 'Pending': 1, 'Success': 2, 'Expired': 3 };
    if (order[a.displayStatus] !== order[b.displayStatus]) {
      return order[a.displayStatus] - order[b.displayStatus];
    }
    // Agar same status hai toh date/time ke hisaab se sort karein
    return a.bookingDateTime - b.bookingDateTime;
  });

  // 👇 YAHAN CHANGES KIYE GAYE HAIN (Center align karne ke liye) 👇
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="form-container-card admin-login-card">
          <h2 className="text-center mb-4">Admin Access</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="form-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#333' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <div className="admin-header">
        <h2>Student Bookings Dashboard</h2>
        <button onClick={fetchBookings} className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Refresh Data</button>
      </div>

      {loading ? (
        <p className="text-center">Loading booking data...</p>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Category</th>
                <th>Mobile</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            {/* Framer motion list transition yahan use ki gayi hai */}
            <motion.tbody layout>
              <AnimatePresence>
                {processedBookings.length === 0 ? (
                  <tr><td colSpan="7" className="text-center" style={{ padding: '30px' }}>No bookings found.</td></tr>
                ) : (
                  processedBookings.map((b) => (
                    <motion.tr 
                      key={b.id}
                      layout // Yeh property smooth moving effect deti hai
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.8, type: "spring" }} // Slow and smooth transition
                    >
                      <td className="token-cell">{b.tokenId}</td>
                      <td style={{ fontWeight: '500' }}>{b.fullName}</td>
                      <td>
                        <span style={{ backgroundColor: '#e1f5ee', color: '#08bd80', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          {b.category}
                        </span>
                      </td>
                      <td>{b.mobileNumber}</td>
                      <td>{b.date} <br/> <span style={{color: '#666', fontSize: '13px'}}>{b.time}</span></td>
                      <td>
                        <span className={`status-badge status-${b.displayStatus.toLowerCase()}`}>
                          {b.displayStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {b.displayStatus === 'Pending' && (
                            <button onClick={() => markSuccess(b.id)} className="action-btn success-btn">✓ Success</button>
                          )}
                          <button onClick={() => deleteBooking(b.id)} className="action-btn delete-btn">🗑 Delete</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;