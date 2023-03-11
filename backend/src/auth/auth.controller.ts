import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import process from "process";
import { AuthDto } from "./dto";

@Controller({})
export class AuthController{
    constructor(private authService: AuthService) {}
    
    // async get42Token(code: string, dto: AuthDto): Promise <string> {
    //     return this.get42Token(code, dto);
    // }

    // @Get('code')
    // getCode(@Param('code') code: string) {
    //     return this.authService.getCode(code);
    // }
    
    @Get('getUserData')
    getUserData(@Query('code') code: string){
        return this.authService.getUserData(code);
    }

    
}