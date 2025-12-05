'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchReports(parsedUser);
  }, [router]);

  const fetchReports = async (userData) => {
    try {
      const response = await fetch(`/api/reports/list?userId=${userData._id || userData.id}`);
      const data = await response.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>

      {/* UPDATED CARDS WITH BETTER COLORS */}
      <div style={{
        display: 'flex',
        gap: '20px',
        margin: '30px 0',
        flexWrap: 'wrap'
      }}>
        {/* TOTAL REPORTS CARD - GREEN THEME */}
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#1b5e20',
          padding: '25px',
          borderRadius: '10px',
          flex: '1',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          border: '3px solid #4caf50'
        }}>
          <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>Total Reports</h3>
          <p style={{
            fontSize: '42px',
            margin: '10px 0',
            fontWeight: 'bold'
          }}>
            {user.reportsCount || 0}
          </p>
          <small style={{ opacity: 0.9 }}>Issues you've reported</small>
        </div>

        {/* VOLUNTEER HOURS CARD - BLUE THEME */}
        <div style={{
          backgroundColor: '#e3f2fd',
          color: '#0d47a1',
          padding: '25px',
          borderRadius: '10px',
          flex: '1',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
          border: '3px solid #2196f3'
        }}>
          <h3 style={{ marginBottom: '15px', fontSize: '20px' }}> Volunteer Hours</h3>
          <p style={{
            fontSize: '42px',
            margin: '10px 0',
            fontWeight: 'bold'
          }}>
            {user.volunteerHours || 0}
          </p>
          <small style={{ opacity: 0.9 }}>Hours contributed</small>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Your Reports</h2>
          <a
            href="/report"
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            New Report
          </a>
        </div>

        {reports.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            {reports.map((report) => (
              <div
                key={report._id}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{report.title}</h3>
                <p style={{ margin: '5px 0' }}>Type: {report.issue_type}</p>
                <p style={{ margin: '5px 0' }}>
                  Status: <span style={{
                    padding: '3px 8px',
                    borderRadius: '3px',
                    backgroundColor:
                      report.status === 'pending' ? '#ffb74d' :
                      report.status === 'resolved' ? '#4caf50' : '#f44336',
                    color: 'white'
                  }}>
                    {report.status}
                  </span>
                </p>

                {/* Show Images if they exist */}
                {report.images && report.images.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '5px 0' }}>Images: {report.images.length}</p>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {report.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.data}
                          alt={`Image ${idx + 1}`}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '3px',
                            border: '1px solid #ddd'
                          }}
                        />
                      ))}
                      {report.images.length > 3 && (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}>
                          +{report.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p style={{ margin: '5px 0', color: '#666' }}>
                  Date: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
            No reports yet. Create your first report!
          </p>
        )}
      </div>
    </div>
  );
}