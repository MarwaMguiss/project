import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable, of } from 'rxjs';
import { User } from 'src/user/models/user.interface';
const bcrypt = require('bcrypt');


@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService){}

    generateJWT(users: User): Observable<string> {
        return from(this.jwtService.signAsync({users}));
    }

    hashPassword(password: string): Observable<string>{
        return from<string>(bcrypt.hash(password,10));
    }

    comparePasswords(newPassword: string, passwordHash: string): Observable<any | boolean>{
        return of<any | boolean>(bcrypt.compare(newPassword, passwordHash));
    }
}
