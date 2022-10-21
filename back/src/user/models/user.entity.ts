import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user.interface";

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({})
    name: string;

    @Column({})
    username: string;

    @Column({})
    email: string;
    
    @Column({})
    password: string;

    @Column({})
    phone: number;

    @Column({type: 'enum', enum: UserRole, default: UserRole.USERS})
    role: UserRole;

    @BeforeInsert()
    emailToLowerCase(){
        this.email = this.email.toLowerCase();
    }
}