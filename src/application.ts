import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import * as firebaseAdmin from "firebase-admin";
import { AuthenticationComponent } from '@loopback/authentication';
import { JWTAuthenticationComponent, TokenServiceBindings } from '@loopback/authentication-jwt';
import { FirebaseTokenService } from './services';

export { ApplicationConfig };

export class Loopback4FirebaseApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // initialize firebase
    // TODO replace the projectId with your firebase project id
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.applicationDefault(),
      projectId: "my-firebase-project"
    })

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // JWT Authentication
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);

    // This is the key component where we tell which class to use
    // to verify the tokens. The class should implement TokenService interface
    this.bind(TokenServiceBindings.TOKEN_SERVICE)
      .toClass(FirebaseTokenService);
  }
}
