import { Injectable, CanActivate, ExecutionContext, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, Observable } from "rxjs";
import { User } from "src/user/models/user.interface";
import { UserService } from "src/user/service/user.service";

@Injectable()
export class  RolesGuard implements CanActivate{
constructor(
    private reflector :Reflector,        
    @Inject(forwardRef(() => UserService))
    private userService: UserService
    ){}

    canActivate(context :ExecutionContext): boolean | Promise<boolean>|Observable<boolean>{
        const  roles = this.reflector.get<string[]>('roles',context.getHandler());
     
     
        if (!roles){
     
         return true;
        }
     
        const request = context.switchToHttp().getRequest();
      
        const users:User = request.user;
         return this.userService.findOne(users.id).pipe(
             map((users:User) => {
     
                 const hasRole = () =>roles.indexOf(users.role) > -1;
                 let hasPermission: boolean = false;
                 if (hasRole()) {
                    hasPermission= true};
                 return users && hasPermission;
             })
         )
     
     }
}
