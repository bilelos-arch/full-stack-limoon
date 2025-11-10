import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const accessToken = request.cookies.get('accessToken')?.value;
  console.log('Frontend API Route: Received accessToken from cookies:', accessToken ? 'present' : 'missing');

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/profile/${id}`;
    console.log('Frontend API Route: Calling backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
    });

    console.log('Frontend API Route: Backend response status:', response.status);
    console.log('Frontend API Route: Backend response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const accessToken = request.cookies.get('accessToken')?.value;
  console.log('Frontend API Route PUT: Received accessToken from cookies:', accessToken ? 'present' : 'missing');
  console.log('Frontend API Route PUT: Received id:', id);

  try {
    const body = await request.text();
    console.log('Frontend API Route PUT: Request body:', body);

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/profile`;
    console.log('Frontend API Route PUT: Calling backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json',
      },
      body: body,
    });

    console.log('Frontend API Route PUT: Backend response status:', response.status);
    console.log('Frontend API Route PUT: Backend response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('Frontend API Route PUT: Backend response data:', data);

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying PUT request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}