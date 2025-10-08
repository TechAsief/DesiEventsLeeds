// Vercel Function: Get public events
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For now, return sample events
    // TODO: Connect to database
    const sampleEvents = [
      {
        id: '1',
        title: 'Sample Event 1',
        description: 'This is a sample event for testing',
        date: '2024-12-15',
        time: '19:00',
        locationText: 'Leeds Town Hall',
        category: 'Cultural',
        contactEmail: 'test@example.com',
        contactPhone: '123-456-7890',
        bookingLink: 'https://example.com',
        imageUrl: '',
        approvalStatus: 'approved',
        isActive: true,
        createdAt: new Date().toISOString(),
        userId: 'sample-user-id'
      },
      {
        id: '2',
        title: 'Sample Event 2',
        description: 'Another sample event',
        date: '2024-12-20',
        time: '18:30',
        locationText: 'Community Center',
        category: 'Social',
        contactEmail: 'test2@example.com',
        contactPhone: '098-765-4321',
        bookingLink: 'https://example2.com',
        imageUrl: '',
        approvalStatus: 'approved',
        isActive: true,
        createdAt: new Date().toISOString(),
        userId: 'sample-user-id-2'
      }
    ];

    res.status(200).json(sampleEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
}
