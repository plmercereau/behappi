'use strict';
const functions = require('firebase-functions');
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
      if (
        (before.data()[originAttributeName] !== after.data()[originAttributeName]) &&
        (before.data()[originAttributeName].id !== after.data()[originAttributeName].id)
      ) {
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
    console.error(snapshot)

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
    updateOneToManyRevertRelation(snap, 'parent', 'children');
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

exports.updateOrgUnit = functions.firestore
  .document('orgUnits/{missionId}') // TODO make is work for every doc of every collection
  .onUpdate((snap) => {
    createDocumentVersion(snap);
    return 0
  });

exports.createDocument = functions.firestore
  .document('{collection}/{docId}')
  .onCreate((snap) => {
    const firestore = admin.firestore();
    const userId = snap.data().userId;
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
    const firestore = admin.firestore();
    const userId = snap.after.data().userId;
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

// exports.createUser = functions.firestore
//   .document('users/{docId}')
//   .onCreate((snap) => {
//     const data = snap.data();
//     admin.auth()
//       .createUser({
//         email: data.email,
//         emailVerified: false,
//         displayName: data.name,
//         photoURL: data.photoURL,
//         disabled: false
//       })
//       .then((userRecord) => {
//         // See the UserRecord reference doc for the contents of userRecord.
//         console.log("Successfully created new user:", userRecord.uid);
//         // TODO send an email to set the password
//         return 0;
//       })
//       .catch((error) => {
//         console.log("Error creating new user:", error);
//         return 0;
//       });
//     return 0;
//   });
//
// exports.updateUser = functions.firestore
//   .document('users/{docId}')
//   .onUpdate((snap) => {
//     const data = snap.after.data();
//     admin.auth()
//       .updateUser(snap.after.id, { // TODO only existing values
//         email: data.email,
//         emailVerified: false,
//         displayName: data.name,
//         photoURL: data.photoURL,
//         disabled: false
//       })
//       .then((userRecord) => {
//         // See the UserRecord reference doc for the contents of userRecord.
//         console.log("Successfully created new user:", userRecord.uid);
//         // TODO send an email if we've been asked to reset the password
//         return 0;
//       })
//       .catch((error) => {
//         console.log("Error updating the user:", error);
//         return 0;
//       });
//     return 0;
//   });
//
// exports.deleteUser = functions.firestore // TODO soft delete: deactivate only?
//   .document('users/{docId}')
//   .onDelete((snap) => {
//     admin.auth().deleteUser(snap.id)
//       .then(() => {
//         console.log("Successfully deleted user");
//         return 0;
//       })
//       .catch((error) => {
//         console.log("Error deleting user:", error);
//         return 0;
//       });
//     return 0;
//   });

exports.createAuthUser = functions.auth.user().onCreate((user) => { // TODO implement the delete trigger as well
  const firestore = admin.firestore();
  const userProfile = firestore.doc(`/users/${user.uid}`);
  userProfile.set({email: user.email, role: 'member'});
  return 0
});
