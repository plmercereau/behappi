'use strict';
const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp();
const FieldValue = require('firebase-admin').firestore.FieldValue;

function addOneToManyRevertRelation(snapshot, originAttributeName, destinationAttributeName) {
  const originAttributeRef = snapshot.data()[originAttributeName];
  originAttributeRef.set({[destinationAttributeName]: {[snapshot.id]: snapshot.ref}}, {merge: true})
}

function removeOneToManyRevertRelation(snapshot, originAttributeName, destinationAttributeName) {
  try {
    const originAttributeRef = snapshot.data()[originAttributeName];
    if (originAttributeRef) {
      originAttributeRef.set({[destinationAttributeName]: {[snapshot.id]: FieldValue.delete()}}, {merge: true})
    } // else console.log(`The attribute ${originAttributeName} was not found in the snapshot ${snapshot}`)
  } catch (e) {
    console.error(e)
  }
}

function updateOneToManyRevertRelation(snapshot, originAttributeName, destinationAttributeName) {
  try {
    const before = snapshot.before;
    const after = snapshot.after;
    if (before.exists && after.exists) { // Update
      // TODO do update refs when they haven't changed! check if the id ref changed
      if (before.data()[originAttributeName] !== after.data()[originAttributeName]) {
          removeOneToManyRevertRelation(before, originAttributeName, destinationAttributeName);
          addOneToManyRevertRelation(after, originAttributeName, destinationAttributeName)
      }
    } else if (after.exists) { // Create
      addOneToManyRevertRelation(after, originAttributeName, destinationAttributeName)
    } else { // Delete
      removeOneToManyRevertRelation(before, originAttributeName, destinationAttributeName);
    }
  } catch (e) {
    console.error(e)
  }
}

function createDocumentVersion(snapshot) {
  try {
    // TODO
    console.log(snapshot)

  } catch (e) {
    console.error(e)
  }
}

function deleteOneToManyDocuments(snapshot, oneToManyAttribute) {
  try {
    const arrayObject = snapshot.data()[oneToManyAttribute];
    if (arrayObject) {
      Object.keys(arrayObject).map(key => {
        if (arrayObject[key]) {
          arrayObject[key].delete()
        }
        return 0
      })
    }
  } catch (e) {
   console.error(e)
  }
}

exports.writeApplicationUsage = functions.firestore
  .document('applicationUsages/{applicationUsageId}')
  .onWrite((snap) => { // TODO test infinite loop (when we will be able to update on both sides of the relation)
    updateOneToManyRevertRelation(snap, 'application', 'applicationUsages');
    updateOneToManyRevertRelation(snap, 'orgUnit', 'applicationUsages');
    return 0
  });

exports.writeOrgUnit = functions.firestore
  .document('orgUnits/{orgUnitId}')
  .onWrite((snap) => { // TODO test infinite loop (when we will be able to update on both sides of the relation)
    updateOneToManyRevertRelation(snap, 'mission', 'projects');
    return 0
  });

exports.deleteApplication = functions.firestore
  .document('applications/{applicationId}')
  .onDelete((snap) => {
    deleteOneToManyDocuments(snap, 'applicationUsages');
    return 0
  });

exports.deleteOrgUnit = functions.firestore
  .document('orgUnits/{orgUnitId}')
  .onDelete((snap) => {
    deleteOneToManyDocuments(snap, 'applicationUsages');
    return 0
  });

exports.updateMission = functions.firestore
  .document('missions/{missionId}') // TODO make is work for every doc of every collection
  .onUpdate((snap) => {
    createDocumentVersion(snap);
    return 0
  });

exports.deleteMission = functions.firestore
  .document('missions/{missionId}')
  .onDelete((snap) => {
    deleteOneToManyDocuments(snap, 'projects');
    return 0
  });

exports.createDocument = functions.firestore
  .document('{collection}/{docId}')
  .onCreate((snap) => {
    const firestore = admin.firestore()
    const userId = snap.data().userId
    if (userId) {
      const user = firestore.doc(`/users/${userId}`);
      let data = {
        createdBy: user,
        createdAt: FieldValue.serverTimestamp(),
        userId: FieldValue.delete()
      };
      if (!snap.data().owner) data['owner'] = user;
      return snap.ref.set(data, {merge: true})
    } else return 0
  });

exports.updateDocument = functions.firestore
  .document('{collection}/{docId}')
  .onUpdate((snap) => {
    const firestore = admin.firestore()
    const userId = snap.after.data().userId
    const user = firestore.doc(`/users/${userId}`);
    let data = {
      updatedBy: user,
      updatedAt: FieldValue.serverTimestamp(),
      userId: FieldValue.delete()
    };
    if (!snap.after.data().owner) data['owner'] = user;
    if (userId) return snap.after.ref.set(data, {merge: true});
    else return 0
  });

exports.createUser = functions.auth.user().onCreate((user) => { // TODO implement the delete trigger as well
  const firestore = admin.firestore()
  const userProfile = firestore.doc(`/users/${user.uid}`);
  userProfile.set({email: user.email})
  return 0
});
