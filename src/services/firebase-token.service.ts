import { injectable, /* inject, */ BindingScope } from '@loopback/core';
import * as firebaseAdmin from "firebase-admin";
import { TokenService } from '@loopback/authentication';
import { securityId, UserProfile } from '@loopback/security';

// Add this so that loopback can tell the user what error happened
class FirebaseTokenError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 403) {
    super(message)
    this.statusCode = statusCode;
  }
}

@injectable({ scope: BindingScope.TRANSIENT })
export class FirebaseTokenService implements TokenService {
  constructor(/* Add @inject to inject parameters */) { }

  tokenToUserProfile (token: firebaseAdmin.auth.DecodedIdToken): UserProfile {
    return {
      [securityId]: token.uid,
      email: token.email,
      name: token.name,
      picture: token.picture,
    }
  }

  async verifyToken (token: string): Promise<UserProfile> {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      return this.tokenToUserProfile(decodedToken);
    } catch (error: any) {
      console.error('%cerror firebase-token.service.ts->verifyToken', 'color: red; display: block; width: 100%;', error);
      throw new FirebaseTokenError(`${error.code}`, 401)
    }
  }

  generateToken (userProfile: UserProfile): Promise<string> {
    throw new FirebaseTokenError('Method not implemented.');
  }

}
