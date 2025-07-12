// Simple test script to verify swap request functionality
// Run this in the browser console when logged in

async function testSwapRequestAcceptance() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found. Please log in first.');
    return;
  }

  console.log('Testing swap request functionality...');

  try {
    // 1. Get current swap requests
    const response = await fetch('/api/swap-requests', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch swap requests: ${response.status}`);
    }

    const swapRequests = await response.json();
    console.log('Current swap requests:', swapRequests);

    // 2. Find a pending request where current user is the receiver
    const pendingRequest = swapRequests.find(req => 
      req.status === 'pending' && req.receiverId !== req.requesterId
    );

    if (!pendingRequest) {
      console.log('No pending swap requests found to test with.');
      return;
    }

    console.log('Found pending request to test:', pendingRequest);

    // 3. Test accepting the request
    const acceptResponse = await fetch(`/api/swap-requests/${pendingRequest.id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'accepted' }),
    });

    if (!acceptResponse.ok) {
      throw new Error(`Failed to accept request: ${acceptResponse.status}`);
    }

    const updatedRequest = await acceptResponse.json();
    console.log('Successfully accepted request:', updatedRequest);

    // 4. Verify the status was updated
    if (updatedRequest.status === 'accepted') {
      console.log('✅ Swap request acceptance test PASSED!');
    } else {
      console.log('❌ Swap request acceptance test FAILED - status not updated');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSwapRequestAcceptance(); 