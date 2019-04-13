const admin = require('firebase-admin');
const serviceAccount = require('../firebase-credentials.PRIVATE.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://advicebase.firebaseio.com'
});

const db = admin.firestore();
const tripsCollection = db.collection('trips');


module.exports.store = function (attraction, user) {
    const date = admin.firestore.FieldValue.serverTimestamp();

    let trip = { attraction, user, date, notified: false };

    tripsCollection.add(trip).then(ref => {
        console.log('Saved trip with ID: ', ref.id);
    });
};

function getNotificationEdgeDateTimestamp() {
    const currentDate = new Date();
    const RECENT_TIME_DAYS = 2; // two days

    const edgeDate = new Date( currentDate.getTime() - (RECENT_TIME_DAYS * 24 * 60 * 60 * 1000) );
    return admin.firestore.Timestamp.fromDate(edgeDate);
}

module.exports.getRecentTripsToNotifyAsync = function () {
    const edgeDate = getNotificationEdgeDateTimestamp();
    console.info('Looking for trips that were before ', edgeDate.toDate().toLocaleString());

    const notificationsQuery = tripsCollection
        .where('notified', '==', false)
        .where('date', '<=', edgeDate);

    return notificationsQuery.get();
};

module.exports.setTripAsNotified = function (tripId) {
    const tripDoc = tripsCollection.doc(tripId);

    tripDoc.update({
        notified: true
    }).then(ref => {
        console.log('Updated trip as notified with ID: ', tripId);
    });
};
