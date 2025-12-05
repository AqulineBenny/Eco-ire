import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function POST(request) {
  try {
    const report = await request.json();

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('eco_eire');

    const result = await db.collection('reports').insertOne(report);

    await db.collection('users').updateOne(
      { _id: report.userId },
      { $inc: { reportsCount: 1 } }
    );

    await client.close();

    return Response.json({
      success: true,
      report: { ...report, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Create report error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    });
  }
}