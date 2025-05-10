const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/hostels/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400 && data.message === 'User can only register one hostel') {
        toast.error('You already have a registered hostel. Only one hostel per user is allowed.');
      } else {
        toast.error(data.message || 'Failed to register hostel');
      }
      setError(data.message || 'Failed to register hostel');
      return;
    }

    toast.success('Hostel registered successfully!');
    navigate('/owner/dashboard');
  } catch (err) {
    console.error('Error:', err);
    setError('An error occurred while registering the hostel');
    toast.error('An error occurred while registering the hostel');
  } finally {
    setLoading(false);
  }
}; 