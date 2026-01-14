import 'dotenv/config';
import { getAllTrips, getTripEventsByTripId } from '../models/db.js';

async function checkEvents() {
  try {
    const trips = await getAllTrips();
    console.log('Total trips:', trips.length);

    for (const trip of trips) {
      console.log('\n=== TRIP:', trip.title, '===');
      const events = await getTripEventsByTripId(trip.id);
      console.log('Total events:', events.length);

      events.forEach(event => {
        console.log('\n---');
        console.log('Event ID:', event.id);
        console.log('Title:', event.title);
        console.log('Has image_blob:', event.image_blob ? 'YES' : 'NO');
        console.log('Has audio_blob:', event.audio_blob ? 'YES' : 'NO');
        console.log('Video URL:', event.video_url || 'none');

        if (event.image_blob) {
          console.log('Image blob type:', typeof event.image_blob);
          console.log('Image blob constructor:', event.image_blob.constructor.name);
          console.log('Image blob size:', event.image_blob.length || event.image_blob.byteLength || 'unknown');
        }
        if (event.audio_blob) {
          console.log('Audio blob type:', typeof event.audio_blob);
          console.log('Audio blob constructor:', event.audio_blob.constructor.name);
          console.log('Audio blob size:', event.audio_blob.length || event.audio_blob.byteLength || 'unknown');
        }
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkEvents();
