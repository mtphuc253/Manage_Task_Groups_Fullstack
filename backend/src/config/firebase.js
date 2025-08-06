import admin from 'firebase-admin'
import serviceAccount from '~/config/upload-image-firebase-adminsdk-oozi1-41edebc1da.json' with { type: 'json' }

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'vivu-image.appspot.com' 
  })
}

// Lấy bucket (thùng chứa file trong Firebase Storage)
const bucket = admin.storage().bucket()

export { bucket }
