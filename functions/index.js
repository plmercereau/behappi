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
  const id = snapshot.id;
  const originAttributeRef = snapshot.data()[originAttributeName];
  if (originAttributeRef) {
    originAttributeRef.set({[destinationAttributeName]: {[id]: snapshot.ref}}, {merge: true})
  } // else { console.log(`The attribute ${originAttributeName} was not found in the snapshot ${snapshot}`) }
}

function removeOneToManyRevertRelation(snapshot, originAttributeName, destinationAttributeName) {
  try {
    const id = snapshot.id;
    const originAttributeRef = snapshot.data()[originAttributeName];
    if (originAttributeRef) {
      originAttributeRef.set({[destinationAttributeName]: {[id]: FieldValue.delete()}}, {merge: true})
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
    console.log('TODO')

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

exports.updateMission = functions.firestore
  .document('missions/{missionId}') // TODO make is work for every doc of every collection
  .onUpdate((snap) => {
    createDocumentVersion(snap);
    return 0
  });
