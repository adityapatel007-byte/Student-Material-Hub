import React from 'react';
import './DashboardPage.css';

const DashboardPage = ({ user }) => {
  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  // Admin Dashboard View
  if (user.role === 'admin') {
    return (
      <div className="dashboard-container admin-dashboard">
        <h1>Welcome, Admin {user.name}!</h1>
        <p>This is your administrative dashboard. Here you can manage users, notes, and requests.</p>
        <div className="admin-actions">
          <button>Manage Notes</button>
          <button>Manage Users</button>
          <button>View Note Requests</button>
        </div>
      </div>
    );
  }

  // Student Dashboard View
  return (
    <div className="dashboard-container student-dashboard">
      <h1>Welcome, {user.name}!</h1>
      <p>This is your personal dashboard. Here's a quick overview of your activity.</p>
      <div className="student-actions">
        <h3>Your Activity</h3>
        <p>You have uploaded <strong>5</strong> notes.</p>
        <p>You have made <strong>2</strong> note requests.</p>
        <button>View My Uploads</button>
        <button>Make a Note Request</button>
      </div>
    </div>
  );
};

export default DashboardPage;