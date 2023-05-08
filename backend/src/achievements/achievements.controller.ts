import { Controller, Get, Put, UseGuards, Param, Body } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard";
import { AchievementsService } from "./achievements.service";

@Controller('/users/achievements')
export class AchievementsController {
    constructor(private achievementsService: AchievementsService) {}

    @UseGuards(JwtGuard)
    @Get(':id/getAchievements')
    async getAchievements(@Param('id') id: number): Promise<[string, boolean][]>{
        return await this.achievementsService.getAchievements(Number(id));
    }

    @UseGuards(JwtGuard)
    @Put(':id/updateAchievements')
    async updateAchievements(@Param('id') id: number, @Body() body: any) {
        return await this.achievementsService.updateAchievements(Number(id), body.achievement);
      }
}