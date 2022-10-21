import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, switchMap, map, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User, UserRole } from '../models/user.interface';
import { paginate, Pagination, IPaginationOptions, } from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService:  AuthService
    ) {}


    create(users : User): Observable<User> {
        return this.authService.hashPassword(users.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = users.name;
                newUser.username = users.username;
                newUser.email = users.email;
                newUser.password = passwordHash;
                newUser.phone = users.phone;
                newUser.role = UserRole.USERS;

                return from(this.userRepository.save(newUser)).pipe(
                    map((users: User) => {
                        const {password, ...result} = users;
                        return result;
                    }),
                    catchError(err => throwError(err))
                )
            })
        )

        
    }

    paginate(options: IPaginationOptions): Observable <Pagination<User>>{
        return from(paginate<User>(this.userRepository, options)).pipe(
            map((usersPageable: Pagination<User>) =>{
                usersPageable.items.forEach(function (v) {delete v.password});
                return usersPageable;
            })
        )
    }

    findOne(id): Observable<User> {
        return from(this.userRepository.findOneBy({id})).pipe(
            map((users: User)=> {
                const {password, ...result} = users;
                return result;
            })
        )
    }

    findAll(): Observable<User[]>{
        return from(this.userRepository.find()).pipe(
            map((users: User[])=> {
                users.forEach(function (v) {delete v.password});
                return users;
            })
        );
    }
    update(id: number, users: User): Observable<UpdateResult>{
        delete users.email;
        delete users.password;
        delete users.role;

        return from(this.userRepository.update(id, users));
    }

    updateRolesOfUser(id: number, users: User): Observable<any>{
        return from(this.userRepository.update(id, users));
    }


    delete(id: number): Observable<DeleteResult>{
        return from(this.userRepository.delete(id));
    }
    
    login(users: User): Observable<string> {
        return this.validateUser(users.email, users.password).pipe(
            switchMap((users: User)=> {
                if(users) {
                    return this.authService.generateJWT(users).pipe(map((jwt: string)=> jwt));
                } else {
                    return 'wrong Credentials';
                }
            })
        )
    }

    validateUser(email: string, password: string): Observable<User> {
        return this.findByMail(email).pipe(
            switchMap((users: User)=> this.authService.comparePasswords(password, users.password).pipe(
                map((match: boolean)=> {
                    if(match) {
                        const {password, ...result} = users;
                        return result;
                    } else {
                        throw Error;
                    }
                })
            ))
        )
    }

    findByMail(email): Observable<User> {
        return from(this.userRepository.findOneBy({email}));
    }
}
